import React, { useMemo } from 'react';

type ArtisticEffect = 'none' | 'vintage' | 'bw' | 'sepia' | 'sketch' | 'oil-painting' | 'cartoon';

interface ImageComparatorProps {
  originalImage: string;
  enhancedImage: string | null;
  brightness: number;
  contrast: number;
  artisticEffect: ArtisticEffect;
}

export const ImageComparator: React.FC<ImageComparatorProps> = ({ originalImage, enhancedImage, brightness, contrast, artisticEffect }) => {
  
  const computedFilter = useMemo(() => {
    let filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    switch (artisticEffect) {
      case 'vintage':
        filter += ' sepia(60%)';
        break;
      case 'bw':
        filter += ' grayscale(100%)';
        break;
      case 'sepia':
        filter += ' sepia(100%)';
        break;
      case 'sketch':
        filter += ' grayscale(100%) contrast(150%) brightness(110%)';
        break;
      case 'oil-painting':
        filter += ' saturate(180%) contrast(130%)';
        break;
      case 'cartoon':
        filter += ' saturate(200%) contrast(150%)';
        break;
      case 'none':
      default:
        // No additional filter
        break;
    }
    return filter;
  }, [brightness, contrast, artisticEffect]);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col items-center">
        <h3 className="text-2xl font-semibold mb-3 text-gray-300">Original (Preview)</h3>
        <div className="w-full aspect-square bg-black/20 rounded-lg overflow-hidden shadow-lg">
          <img 
            src={originalImage} 
            alt="Original" 
            className="w-full h-full object-contain transition-all duration-200"
            style={{ filter: computedFilter }}
           />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <h3 className="text-2xl font-semibold mb-3 text-gray-300">Enhanced</h3>
        <div className="w-full aspect-square bg-black/20 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
          {enhancedImage ? (
            <img src={enhancedImage} alt="Enhanced" className="w-full h-full object-contain" />
          ) : (
            <div className="text-gray-500">Waiting for enhancement...</div>
          )}
        </div>
      </div>
    </div>
  );
};