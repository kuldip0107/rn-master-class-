import { NativeModules, Platform } from 'react-native';

const { NativeFileDownloader } = NativeModules;

export const saveToDownloads = async (sourceFilePath, fileName) => {
  if (Platform.OS !== 'android') {
    return { success: true, filePath: sourceFilePath };
  }

  if (!NativeFileDownloader || !NativeFileDownloader.saveToDownloads) {
    console.warn('NativeFileDownloader native module is not linked.');
    return { success: false, filePath: sourceFilePath };
  }

  try {
    const result = await NativeFileDownloader.saveToDownloads(sourceFilePath, fileName);
    return result;
  } catch (error) {
    console.error('Failed to save to Downloads directory:', error);
    throw error;
  }
};

export const openDownloadedFile = async (filePath) => {
  if (Platform.OS !== 'android') return false;

  if (!NativeFileDownloader || !NativeFileDownloader.openFile) {
    console.warn('NativeFileDownloader.openFile is not available.');
    return false;
  }

  try {
    await NativeFileDownloader.openFile(filePath);
    return true;
  } catch (error) {
    console.error('Failed to open PDF file:', error);
    throw error;
  }
};

export const shareDownloadedFile = async (filePath) => {
  if (Platform.OS !== 'android') return false;

  if (!NativeFileDownloader || !NativeFileDownloader.shareFile) {
    console.warn('NativeFileDownloader.shareFile is not available.');
    return false;
  }

  try {
    await NativeFileDownloader.shareFile(filePath);
    return true;
  } catch (error) {
    console.error('Failed to share PDF file:', error);
    throw error;
  }
};
