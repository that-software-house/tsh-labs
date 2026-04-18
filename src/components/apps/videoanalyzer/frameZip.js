function sanitizeFileName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'frame';
}

function dataUrlToBytes(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  if (!header || !base64) {
    throw new Error('Invalid image data.');
  }

  const mimeMatch = header.match(/data:([^;]+)/i);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return { bytes, mimeType };
}

function makeCRCTable() {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let crc = index;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
    table[index] = crc >>> 0;
  }

  return table;
}

const CRC_TABLE = makeCRCTable();

function crc32(bytes) {
  let crc = 0xffffffff;

  for (let index = 0; index < bytes.length; index += 1) {
    crc = CRC_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function encodeText(text) {
  return new TextEncoder().encode(text);
}

function createZipEntry(fileName, bytes) {
  const nameBytes = encodeText(fileName);
  const crc = crc32(bytes);

  return {
    fileName,
    nameBytes,
    bytes,
    crc,
    compressedSize: bytes.length,
    uncompressedSize: bytes.length,
    localHeaderSize: 30 + nameBytes.length,
    centralHeaderSize: 46 + nameBytes.length,
  };
}

function writeUint16(view, offset, value) {
  view.setUint16(offset, value, true);
}

function writeUint32(view, offset, value) {
  view.setUint32(offset, value, true);
}

function writeBytes(target, offset, bytes) {
  target.set(bytes, offset);
}

function buildZip(entries) {
  let localOffset = 0;
  let centralOffset = 0;
  let localSectionSize = 0;
  let centralSectionSize = 0;

  entries.forEach((entry) => {
    localSectionSize += entry.localHeaderSize + entry.bytes.length;
    centralSectionSize += entry.centralHeaderSize;
  });

  const endSize = 22;
  const output = new Uint8Array(localSectionSize + centralSectionSize + endSize);
  const view = new DataView(output.buffer);
  const centralDirectoryStart = localSectionSize;

  entries.forEach((entry) => {
    entry.localHeaderOffset = localOffset;

    writeUint32(view, localOffset, 0x04034b50);
    writeUint16(view, localOffset + 4, 20);
    writeUint16(view, localOffset + 6, 0);
    writeUint16(view, localOffset + 8, 0);
    writeUint16(view, localOffset + 10, 0);
    writeUint16(view, localOffset + 12, 0);
    writeUint32(view, localOffset + 14, entry.crc);
    writeUint32(view, localOffset + 18, entry.compressedSize);
    writeUint32(view, localOffset + 22, entry.uncompressedSize);
    writeUint16(view, localOffset + 26, entry.nameBytes.length);
    writeUint16(view, localOffset + 28, 0);
    writeBytes(output, localOffset + 30, entry.nameBytes);
    writeBytes(output, localOffset + entry.localHeaderSize, entry.bytes);

    localOffset += entry.localHeaderSize + entry.bytes.length;
  });

  entries.forEach((entry) => {
    const offset = centralDirectoryStart + centralOffset;

    writeUint32(view, offset, 0x02014b50);
    writeUint16(view, offset + 4, 20);
    writeUint16(view, offset + 6, 20);
    writeUint16(view, offset + 8, 0);
    writeUint16(view, offset + 10, 0);
    writeUint16(view, offset + 12, 0);
    writeUint16(view, offset + 14, 0);
    writeUint32(view, offset + 16, entry.crc);
    writeUint32(view, offset + 20, entry.compressedSize);
    writeUint32(view, offset + 24, entry.uncompressedSize);
    writeUint16(view, offset + 28, entry.nameBytes.length);
    writeUint16(view, offset + 30, 0);
    writeUint16(view, offset + 32, 0);
    writeUint16(view, offset + 34, 0);
    writeUint16(view, offset + 36, 0);
    writeUint32(view, offset + 38, 0);
    writeUint32(view, offset + 42, entry.localHeaderOffset);
    writeBytes(output, offset + 46, entry.nameBytes);

    centralOffset += entry.centralHeaderSize;
  });

  const endOffset = centralDirectoryStart + centralSectionSize;
  writeUint32(view, endOffset, 0x06054b50);
  writeUint16(view, endOffset + 4, 0);
  writeUint16(view, endOffset + 6, 0);
  writeUint16(view, endOffset + 8, entries.length);
  writeUint16(view, endOffset + 10, entries.length);
  writeUint32(view, endOffset + 12, centralSectionSize);
  writeUint32(view, endOffset + 16, centralDirectoryStart);
  writeUint16(view, endOffset + 20, 0);

  return new Blob([output], { type: 'application/zip' });
}

function extensionFromMimeType(mimeType) {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('gif')) return 'gif';
  return 'jpg';
}

export function downloadFramesZip(frames, selectedIndices) {
  const entries = selectedIndices.map((selectedIndex, order) => {
    const frame = frames[selectedIndex];
    if (!frame?.base64) {
      throw new Error('One or more selected frames are missing image data.');
    }

    const { bytes, mimeType } = dataUrlToBytes(frame.base64);
    const extension = extensionFromMimeType(mimeType);
    const timeLabel = sanitizeFileName(frame.timestamp || `frame-${selectedIndex + 1}`);
    const fileName = `${String(order + 1).padStart(2, '0')}-${timeLabel}.${extension}`;

    return createZipEntry(fileName, bytes);
  });

  if (entries.length === 0) {
    throw new Error('No frames selected.');
  }

  const zipBlob = buildZip(entries);
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `video-frames-${Date.now()}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
