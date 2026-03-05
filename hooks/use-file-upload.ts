/* eslint-disable no-console */
import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FileUploadConfig,
  FileMetadata,
  FileValidationResult,
  ImageDimensionConfig,
  FileUploadState,
  FileUploadCallbacks,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DEFAULT_FILE_TYPES,
} from '@/types/file-upload';
import {
  formatFileSize,
  getFileExtension,
  isImageFile,
  generateFileId,
  getImageDimensions,
  validateFiles,
  FileUploadError,
  FILE_UPLOAD_ERROR_CODES,
} from '@/lib/file-upload-utils';
import { reportError, reportMessage } from '@/lib/error-reporting';

interface UseFileUploadOptions {
  config: FileUploadConfig;
  imageConfig?: ImageDimensionConfig;
  callbacks?: FileUploadCallbacks;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadFunction?: (file: File) => Promise<any>;
  customValidation?: (file: File) => Promise<FileValidationResult>;
}

export function useFileUpload({
  config,
  imageConfig,
  callbacks,
  uploadFunction,
  customValidation,
}: UseFileUploadOptions) {
  const [state, setState] = useState<FileUploadState>({
    files: [],
    isProcessing: false,
    isUploading: false,
    isDragActive: false,
    isDisabled: config.disabled || false,
  });

  const uploadAbortControllers = useRef<Map<string, AbortController>>(
    new Map()
  );

  // Use utility functions from file-upload-utils

  // Use getImageDimensions from utils

  // Validate file using utility functions
  const validateFile = useCallback(
    async (file: File): Promise<FileValidationResult> => {
      try {
        const results = await validateFiles([file], {
          maxSize: config.maxSize,
          accept: config.accept,
          imageConfig,
        });

        const result = results[0];
        if (!result) {
          throw new FileUploadError(
            'Validation failed',
            FILE_UPLOAD_ERROR_CODES.VALIDATION_ERROR
          );
        }

        // Run custom validation if provided
        if (customValidation) {
          try {
            const customResult = await customValidation(file);
            result.validation.errors.push(...customResult.errors);
            result.validation.warnings.push(...customResult.warnings);
            result.validation.isValid = result.validation.errors.length === 0;
          } catch (error) {
            result.validation.errors.push(
              `Custom validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            result.validation.isValid = false;
          }
        }

        return result.validation;
      } catch (error) {
        return {
          isValid: false,
          errors: [
            error instanceof Error ? error.message : 'Validation failed',
          ],
          warnings: [],
        };
      }
    },
    [config, imageConfig, customValidation]
  );

  // Create file metadata
  const createFileMetadata = useCallback(
    async (file: File): Promise<FileMetadata> => {
      const id = generateFileId();
      const extension = getFileExtension(file.name);
      const isImage = isImageFile(file);

      let dimensions;
      let previewUrl;

      if (isImage) {
        try {
          dimensions = await getImageDimensions(file);
          previewUrl = URL.createObjectURL(file);
        } catch (error) {
          reportMessage(
            'Failed to get image dimensions or preview',
            'warning',
            {
              fileName: file.name,
            }
          );
        }
      }

      const validation = await validateFile(file);

      return {
        file,
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        extension,
        isImage,
        dimensions,
        previewUrl,
        status: 'pending',
        validation,
      };
    },
    [validateFile]
  );

  // Process files
  const processFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setState(prev => ({ ...prev, isProcessing: true }));

      try {
        // Check max files limit
        if (
          config.maxFiles &&
          state.files.length + files.length > config.maxFiles
        ) {
          throw new Error(`Maximum ${config.maxFiles} files allowed`);
        }

        const fileMetadataPromises = files.map(createFileMetadata);
        const fileMetadata = await Promise.all(fileMetadataPromises);

        setState(prev => ({
          ...prev,
          files: [...prev.files, ...fileMetadata],
          isProcessing: false,
        }));

        callbacks?.onFilesAdded?.(fileMetadata);

        // Report validation errors
        fileMetadata.forEach(file => {
          if (!file.validation?.isValid && file.validation?.errors.length) {
            callbacks?.onValidationError?.(file, file.validation.errors);
          }
        });
      } catch (error) {
        setState(prev => ({ ...prev, isProcessing: false }));
        reportError(error, { context: 'file-upload-processFiles' });
      }
    },
    [config.maxFiles, state.files.length, createFileMetadata, callbacks]
  );

  // Remove file
  const removeFile = useCallback(
    (fileId: string) => {
      setState(prev => {
        const fileToRemove = prev.files.find(f => f.id === fileId);
        if (fileToRemove?.previewUrl) {
          URL.revokeObjectURL(fileToRemove.previewUrl);
        }

        // Cancel upload if in progress
        const abortController = uploadAbortControllers.current.get(fileId);
        if (abortController) {
          abortController.abort();
          uploadAbortControllers.current.delete(fileId);
        }

        const newFiles = prev.files.filter(f => f.id !== fileId);
        return { ...prev, files: newFiles };
      });

      callbacks?.onFilesRemoved?.([fileId]);
    },
    [callbacks]
  );

  // Upload file
  const uploadFile = useCallback(
    async (fileId: string) => {
      const fileMetadata = state.files.find(f => f.id === fileId);
      if (!fileMetadata || !uploadFunction) return;

      const abortController = new AbortController();
      uploadAbortControllers.current.set(fileId, abortController);

      setState(prev => ({
        ...prev,
        files: prev.files.map(f =>
          f.id === fileId ? { ...f, status: 'uploading' as const } : f
        ),
        isUploading: true,
      }));

      try {
        const result = await uploadFunction(fileMetadata.file);

        setState(prev => ({
          ...prev,
          files: prev.files.map(f =>
            f.id === fileId ? { ...f, status: 'success' as const } : f
          ),
        }));

        callbacks?.onUploadComplete?.(fileId, result);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Upload was cancelled
          setState(prev => ({
            ...prev,
            files: prev.files.map(f =>
              f.id === fileId ? { ...f, status: 'pending' as const } : f
            ),
          }));
        } else {
          setState(prev => ({
            ...prev,
            files: prev.files.map(f =>
              f.id === fileId
                ? {
                    ...f,
                    status: 'error' as const,
                    error:
                      error instanceof Error ? error.message : 'Upload failed',
                  }
                : f
            ),
          }));
          callbacks?.onUploadError?.(
            fileId,
            error instanceof Error ? error : new Error('Upload failed')
          );
        }
      } finally {
        uploadAbortControllers.current.delete(fileId);
        setState(prev => ({ ...prev, isUploading: false }));
      }
    },
    [state.files, uploadFunction, callbacks]
  );

  // Upload all files
  const uploadAllFiles = useCallback(async () => {
    const validFiles = state.files.filter(
      f => f.validation?.isValid && f.status === 'pending'
    );

    if (validFiles.length === 0) return;

    callbacks?.onUploadStart?.(validFiles);

    const uploadPromises = validFiles.map(file => uploadFile(file.id));
    const results = await Promise.allSettled(uploadPromises);

    const successfulResults = results
      .map((result, index) => ({ fileId: validFiles[index].id, result }))
      .filter(({ result }) => result.status === 'fulfilled')

      .map(({ fileId, result }) => ({
        fileId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result: (result as PromiseFulfilledResult<any>).value,
      }));

    callbacks?.onAllUploadsComplete?.(successfulResults);
  }, [state.files, uploadFile, callbacks]);

  // Clear all files
  const clearAllFiles = useCallback(() => {
    state.files.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });

    // Cancel all uploads
    uploadAbortControllers.current.forEach(controller => controller.abort());
    uploadAbortControllers.current.clear();

    setState(prev => ({ ...prev, files: [] }));
  }, [state.files]);

  // Dropzone configuration
  const dropzoneConfig = {
    onDrop: processFiles,
    onDragEnter: () => setState(prev => ({ ...prev, isDragActive: true })),
    onDragLeave: () => setState(prev => ({ ...prev, isDragActive: false })),
    onDragOver: () => setState(prev => ({ ...prev, isDragActive: true })),
    accept: config.accept,
    maxSize: config.maxSize,
    multiple: config.multiple,
    disabled: state.isDisabled || state.isProcessing,
  };

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone(dropzoneConfig);

  return {
    // State
    files: state.files,
    isProcessing: state.isProcessing,
    isUploading: state.isUploading,
    isDragActive: state.isDragActive || isDragActive,
    isDisabled: state.isDisabled,

    // Actions
    processFiles,
    removeFile,
    uploadFile,
    uploadAllFiles,
    clearAllFiles,

    // Dropzone props
    getRootProps,
    getInputProps,

    // Utilities
    formatFileSize,
  };
}
