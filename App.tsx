import React, { useState, useCallback } from 'react';
import { enhanceImageWithGemini } from './services/geminiService';
import { FileUploader } from './components/FileUploader';
import { ImageComparator } from './components/ImageComparator';
import { Spinner } from './components/Spinner';

type AppState = 'idle' | 'loading' | 'success' | 'error';
type ArtisticEffect = 'none' | 'vintage' | 'bw' | 'sepia' | 'sketch' | 'oil-painting' | 'cartoon';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [noiseReduction, setNoiseReduction] = useState(0);
  const [artisticEffect, setArtisticEffect] = useState<ArtisticEffect>('none');

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage(reader.result as string);
      setOriginalMimeType(file.type);
      setEnhancedImage(null);
      setError(null);
      setAppState('idle');
      handleResetSettings(); // Reset all settings on new image
    };
    reader.onerror = () => {
      setError('Error reading the file.');
      setAppState('error');
    };
    reader.readAsDataURL(file);
  };

  const handleEnhanceClick = useCallback(async () => {
    if (!originalImage || !originalMimeType) {
      setError('Please select an image first.');
      setAppState('error');
      return;
    }
    
    setAppState('loading');
    setError(null);
    setEnhancedImage(null);

    let prompt = "Fix this old and damaged photo. Improve its overall quality, and adjust the lighting and contrast to make it look more vibrant and clear.";
    if (brightness !== 100) {
      prompt += ` Adjust the brightness to be around ${brightness}%.`;
    }
    if (contrast !== 100) {
      prompt += ` Adjust the contrast to be around ${contrast}%.`;
    }
    if (noiseReduction > 0) {
      prompt += ` Apply noise reduction at an intensity of about ${noiseReduction}%.`;
    }
    switch (artisticEffect) {
        case 'vintage':
            prompt += ' Apply a vintage effect to the image.';
            break;
        case 'bw':
            prompt += ' Convert the image to artistic black and white, preserving details.';
            break;
        case 'sepia':
            prompt += ' Apply a warm sepia tone to the image.';
            break;
        case 'sketch':
            prompt += ' Turn the image into a pencil sketch, emphasizing lines and shading.';
            break;
        case 'oil-painting':
            prompt += ' Make the image look like an oil painting with visible brush strokes and rich colors.';
            break;
        case 'cartoon':
            prompt += ' Apply a cartoon effect to the image with vibrant colors and bold outlines.';
            break;
    }


    try {
      const base64Data = originalImage.split(',')[1];
      const result = await enhanceImageWithGemini(base64Data, originalMimeType, prompt);
      setEnhancedImage(result);
      setAppState('success');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while enhancing the image.');
      setAppState('error');
    }
  }, [originalImage, originalMimeType, brightness, contrast, noiseReduction, artisticEffect]);

  const handleReset = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setOriginalMimeType(null);
    setError(null);
    setAppState('idle');
    handleResetSettings();
  };

  const handleResetSettings = () => {
    setBrightness(100);
    setContrast(100);
    setNoiseReduction(0);
    setArtisticEffect('none');
  };
  
  const handleDownload = () => {
    if (!enhancedImage) return;
    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = `enhanced-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const artisticEffectOptions: { id: ArtisticEffect, label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'bw', label: 'B&W' },
    { id: 'sepia', label: 'Sepia' },
    { id: 'sketch', label: 'Sketch' },
    { id: 'oil-painting', label: 'Oil Painting' },
    { id: 'cartoon', label: 'Cartoon' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          AI Image Enhancer
        </h1>
        <p className="text-lg text-gray-300 mt-2">
          Fix your old photos and add artistic touches with a single click
        </p>
      </header>
      
      <main className="w-full max-w-5xl flex-grow flex flex-col items-center justify-center bg-gray-800/50 rounded-2xl shadow-2xl p-6 transition-all duration-500 ease-in-out">
        {!originalImage ? (
          <FileUploader onFileSelect={handleFileSelect} />
        ) : (
          <div className="w-full flex flex-col items-center">
            {appState === 'loading' && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-2xl z-10">
                    <Spinner />
                    <p className="text-xl mt-4 text-gray-200 animate-pulse">Enhancing, this may take some time...</p>
                </div>
            )}

            <ImageComparator 
              originalImage={originalImage} 
              enhancedImage={enhancedImage} 
              brightness={brightness} 
              contrast={contrast}
              artisticEffect={artisticEffect}
            />

            {/* Adjustment Controls */}
            <div className="w-full max-w-2xl my-6 p-4 bg-gray-900/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                <div>
                  <label htmlFor="brightness" className="block mb-2 text-sm font-medium text-gray-300">Brightness: {brightness}%</label>
                  <input id="brightness" type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <label htmlFor="contrast" className="block mb-2 text-sm font-medium text-gray-300">Contrast: {contrast}%</label>
                  <input id="contrast" type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <label htmlFor="noiseReduction" className="block mb-2 text-sm font-medium text-gray-300">Noise Reduction: {noiseReduction}%</label>
                  <input id="noiseReduction" type="range" min="0" max="100" value={noiseReduction} onChange={(e) => setNoiseReduction(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                </div>
              </div>
               
               <div className="mt-6">
                <label className="block mb-3 text-sm font-medium text-gray-300 text-center">Artistic Effect</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {artisticEffectOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setArtisticEffect(option.id)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${artisticEffect === option.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
               </div>

               <button onClick={handleResetSettings} className="w-full mt-6 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 bg-gray-700 hover:bg-gray-600 text-gray-300">Reset Settings</button>
            </div>

            {error && <p className="text-red-400 mt-4 text-center bg-red-900/50 px-4 py-2 rounded-md">{error}</p>}
            
            <div className="mt-2 flex flex-wrap justify-center gap-4">
              {appState !== 'loading' && (
                <button
                  onClick={handleEnhanceClick}
                  disabled={appState === 'loading'}
                  className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:scale-100"
                >
                  Enhance Image
                </button>
              )}
              {appState === 'success' && enhancedImage && (
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                >
                  Download Enhanced
                </e-button>
              )}
               <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                >
                  Start Over
                </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;