import React from 'react';

const ProjectSubmissionLoading = () => {
  return (
    <div className='flex flex-col items-center justify-center gap-4'>
      <div className='border-primary h-16 w-16 animate-spin rounded-full border-4 border-dashed'></div>
      <p className='text-lg font-medium text-white'>
        Submitting your project...
      </p>
    </div>
  );
};

export default ProjectSubmissionLoading;
