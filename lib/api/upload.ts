import api from './api';

// Types for file upload
export interface UploadResponse {
  success: boolean;
  data: {
    publicId: string;
    url: string;
    secure_url: string;
    width?: number;
    height?: number;
    format: string;
    bytes: number;
  };
  message?: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  data: UploadResponse['data'][];
  message?: string;
}

export interface FileInfo {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: string;
  tags: string[];
  folder: string;
}

export interface SearchFilesResponse {
  success: boolean;
  data: FileInfo[];
  totalCount: number;
  message?: string;
}

export interface OptimizedUrlResponse {
  success: boolean;
  data: {
    url: string;
    transformations: {
      width: number;
      height: number;
      crop: string;
      quality: string;
      format: string;
    };
  };
  message?: string;
}

export interface ResponsiveUrlsResponse {
  success: boolean;
  data: Array<{
    width: number;
    url: string;
    suffix: string;
  }>;
  message?: string;
}

export interface UsageStatsResponse {
  success: boolean;
  data: {
    bytes: number;
    transformations: number;
    bandwidth: number;
    requests: number;
  };
  message?: string;
}

// Upload service class
class UploadService {
  /**
   * Upload a single file
   */
  async uploadSingle(
    file: File,
    options?: {
      folder?: string;
      tags?: string[];
      transformation?: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: string;
        format?: string;
      };
    }
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    if (options?.tags && options.tags.length > 0) {
      options.tags.forEach(tag => {
        formData.append('tags[]', tag);
      });
    }

    const response = await api.post<UploadResponse>(
      '/upload/single',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: File[],
    options?: {
      folder?: string;
      tags?: string[];
    }
  ): Promise<MultipleUploadResponse> {
    const formData = new FormData();

    files.forEach(file => {
      formData.append(`files`, file);
    });

    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    if (options?.tags && options.tags.length > 0) {
      options.tags.forEach(tag => {
        formData.append('tags[]', tag);
      });
    }

    const response = await api.post<MultipleUploadResponse>(
      '/upload/multiple',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Delete a file
   */
  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image'
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/upload/${publicId}/${resourceType}`);
    return response.data;
  }

  /**
   * Get file information
   */
  async getFileInfo(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image'
  ): Promise<{ success: boolean; data: FileInfo; message?: string }> {
    const response = await api.get(`/upload/info/${publicId}/${resourceType}`);
    return response.data;
  }

  /**
   * Search files
   */
  async searchFiles(params?: {
    tags?: string[];
    folder?: string;
    resourceType?: 'image' | 'video' | 'raw';
    maxResults?: number;
  }): Promise<SearchFilesResponse> {
    const searchParams = new URLSearchParams();

    if (params?.tags) {
      searchParams.append('tags', params.tags.join(','));
    }

    if (params?.folder) {
      searchParams.append('folder', params.folder);
    }

    if (params?.resourceType) {
      searchParams.append('resourceType', params.resourceType);
    }

    if (params?.maxResults) {
      searchParams.append('maxResults', params.maxResults.toString());
    }

    const response = await api.get<SearchFilesResponse>(
      `/upload/search?${searchParams.toString()}`
    );
    return response.data;
  }

  /**
   * Generate optimized URL
   */
  async generateOptimizedUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
    }
  ): Promise<OptimizedUrlResponse> {
    const searchParams = new URLSearchParams();

    if (options?.width) {
      searchParams.append('width', options.width.toString());
    }

    if (options?.height) {
      searchParams.append('height', options.height.toString());
    }

    if (options?.crop) {
      searchParams.append('crop', options.crop);
    }

    if (options?.quality) {
      searchParams.append('quality', options.quality);
    }

    if (options?.format) {
      searchParams.append('format', options.format);
    }

    const response = await api.get<OptimizedUrlResponse>(
      `/upload/optimize/${publicId}?${searchParams.toString()}`
    );
    return response.data;
  }

  /**
   * Generate responsive URLs
   */
  async generateResponsiveUrls(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
    }
  ): Promise<ResponsiveUrlsResponse> {
    const searchParams = new URLSearchParams();

    if (options?.width) {
      searchParams.append('width', options.width.toString());
    }

    if (options?.height) {
      searchParams.append('height', options.height.toString());
    }

    if (options?.crop) {
      searchParams.append('crop', options.crop);
    }

    if (options?.quality) {
      searchParams.append('quality', options.quality);
    }

    if (options?.format) {
      searchParams.append('format', options.format);
    }

    const response = await api.get<ResponsiveUrlsResponse>(
      `/upload/responsive/${publicId}?${searchParams.toString()}`
    );
    return response.data;
  }

  /**
   * Generate avatar URL
   */
  async generateAvatarUrl(
    publicId: string,
    size: number = 200
  ): Promise<OptimizedUrlResponse> {
    const response = await api.get<OptimizedUrlResponse>(
      `/upload/avatar/${publicId}?size=${size}`
    );
    return response.data;
  }

  /**
   * Generate logo URL
   */
  async generateLogoUrl(
    publicId: string,
    width: number = 400,
    height: number = 400
  ): Promise<OptimizedUrlResponse> {
    const response = await api.get<OptimizedUrlResponse>(
      `/upload/logo/${publicId}?width=${width}&height=${height}`
    );
    return response.data;
  }

  /**
   * Generate banner URL
   */
  async generateBannerUrl(
    publicId: string,
    width: number = 1200,
    height: number = 600
  ): Promise<OptimizedUrlResponse> {
    const response = await api.get<OptimizedUrlResponse>(
      `/upload/banner/${publicId}?width=${width}&height=${height}`
    );
    return response.data;
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<UsageStatsResponse> {
    const response = await api.get<UsageStatsResponse>('/upload/stats');
    return response.data;
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: File,
    maxSize: number = 10 * 1024 * 1024
  ): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
      };
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error:
          'File type not supported. Please use JPEG, PNG, GIF, WebP, SVG, MP4, WebM, or QuickTime.',
      };
    }

    return { isValid: true };
  }

  /**
   * Get supported image formats
   */
  getSupportedImageFormats(): string[] {
    return ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'];
  }

  /**
   * Get supported video formats
   */
  getSupportedVideoFormats(): string[] {
    return ['mp4', 'webm', 'mov', 'avi', 'mkv'];
  }
}

// Export singleton instance
export const uploadService = new UploadService();

export { UploadService };

export const uploadProjectLogo = async (file: File, projectId: string) => {
  return uploadService.uploadSingle(file, {
    folder: `boundless/projects/${projectId}`,
    tags: ['project', 'logo'],
    transformation: {
      width: 400,
      height: 400,
      crop: 'fit',
      quality: 'auto',
      format: 'auto',
    },
  });
};

export const uploadProjectBanner = async (file: File, projectId: string) => {
  return uploadService.uploadSingle(file, {
    folder: `boundless/projects/${projectId}`,
    tags: ['project', 'banner'],
    transformation: {
      width: 1200,
      height: 600,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    },
  });
};

export const uploadUserAvatar = async (file: File, userId: string) => {
  return uploadService.uploadSingle(file, {
    folder: `boundless/users/${userId}`,
    tags: ['user', 'avatar'],
    transformation: {
      width: 200,
      height: 200,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    },
  });
};

export const uploadProjectGallery = async (
  files: File[],
  projectId: string
) => {
  return uploadService.uploadMultiple(files, {
    folder: `boundless/projects/${projectId}/gallery`,
    tags: ['project', 'gallery'],
  });
};

/**
 * Upload milestone evidence documents
 */
export const uploadMilestoneDocuments = async (
  files: File[],
  campaignId: string,
  milestoneIndex: number
) => {
  return uploadService.uploadMultiple(files, {
    folder: `boundless/campaigns/${campaignId}/milestones/${milestoneIndex}`,
    tags: ['milestone', 'evidence', 'document'],
  });
};

export default uploadService;
