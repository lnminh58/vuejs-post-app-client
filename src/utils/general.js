import imageCompression from 'browser-image-compression';

export const compressImage = async (
  file,
  option = {
    maxSizeMB: 2,
    maxWidthOrHeight: 1500,
    useWebWorker: true,
  },
) => {
  try {
    const blob = await imageCompression(file, option);

    return new File([blob], file.name, {
      type: file.type,
    });
  } catch (error) {
    return file;
  }
};
