"use client";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Model } from "./components/Tshirt";
import { useSnapshot } from "valtio";
import { useRef, useState, useCallback, useEffect } from "react";
import { state } from "./store";
import { Upload, Trash2, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import Navbar from "./components/Navbar";

export default function App() {
  const snap = useSnapshot(state);
  const decalFileInputRef = useRef(null);
  const [showControls, setShowControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedColor = localStorage.getItem('tshirtColor');
    const savedDecals = localStorage.getItem('tshirtDecals');
    const savedActiveDecalIndex = localStorage.getItem('activeDecalIndex');

    if (savedColor) {
      state.tshirtColor = savedColor;
    }
    
    if (savedDecals) {
      try {
        const parsedDecals = JSON.parse(savedDecals);
        state.decalTextures = parsedDecals;
        
        // Set show controls based on loaded decals
        if (parsedDecals.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setShowControls(true);
        }
      } catch (error) {
        console.error('Error parsing saved decals:', error);
        state.decalTextures = [];
      }
    }

    if (savedActiveDecalIndex) {
      state.activeDecalIndex = parseInt(savedActiveDecalIndex);
    }
  }, []);

  // Save to localStorage whenever relevant state changes
  useEffect(() => {
    localStorage.setItem('tshirtColor', snap.tshirtColor);
    localStorage.setItem('tshirtDecals', JSON.stringify(snap.decalTextures));
    localStorage.setItem('activeDecalIndex', snap.activeDecalIndex.toString());
  }, [snap.tshirtColor, snap.decalTextures, snap.activeDecalIndex]);

  const handleColorChange = useCallback((event) => {
    state.tshirtColor = event.target.value;
  }, []);

  const handleDecalUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newDecal = {
          id: Date.now() + Math.random(),
          texture: e.target.result,
          position: [0, 0.1, 0.1],
          rotation: [0, 0, 0],
          scale: [0.15, 0.15, 0.15]
        };
        state.decalTextures = [...state.decalTextures, newDecal];
        state.activeDecalIndex = state.decalTextures.length - 1;
        setShowControls(true);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  }, []);

  const removeDecal = useCallback((id) => {
    state.decalTextures = state.decalTextures.filter(decal => decal.id !== id);
    
    if (state.decalTextures.length === 0) {
      state.activeDecalIndex = 0;
      setShowControls(false);
    } else if (state.activeDecalIndex >= state.decalTextures.length) {
      state.activeDecalIndex = state.decalTextures.length - 1;
    }
  }, []);

  const updateDecalProperty = useCallback((property, axis, value) => {
    const index = state.activeDecalIndex;
    if (!state.decalTextures[index]) return;
    
    const decal = state.decalTextures[index];
    const newValue = [...decal[property]];
    newValue[axis] = parseFloat(value);
    
    state.decalTextures[index] = {
      ...decal,
      [property]: newValue
    };
  }, []);

  const handlePositionChange = useCallback((axis, value) => {
    updateDecalProperty('position', axis, value);
  }, [updateDecalProperty]);

  const handleRotationChange = useCallback((axis, value) => {
    updateDecalProperty('rotation', axis, value);
  }, [updateDecalProperty]);

  const handleScaleChange = useCallback((axis, value) => {
    updateDecalProperty('scale', axis, value);
  }, [updateDecalProperty]);

  const clearAllData = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem('tshirtColor');
    localStorage.removeItem('tshirtDecals');
    localStorage.removeItem('activeDecalIndex');
    
    // Reset state to defaults
    state.tshirtColor = '#ffffff';
    state.decalTextures = [];
    state.activeDecalIndex = 0;
    setShowControls(false);
    setMobileMenuOpen(false);
  }, []);

  const activeDecal = snap.decalTextures[snap.activeDecalIndex];

  return (
    <div className="h-screen relative bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Mobile Menu Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-20 left-4 z-20 bg-black text-white p-3 rounded-full shadow-lg transition-all"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Main Control Panel */}
      <div className={`
        fixed z-10 bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl space-y-5 border border-gray-200
        ${isMobile 
          ? `top-32 left-4 right-4 p-5 transition-all duration-300 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`
          : 'top-24 left-6 w-72 p-6'
        }
      `}>
        <div className="flex items-center justify-between">
          <h1 className={`font-bold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            T-Shirt Designer
          </h1>
          <button
            onClick={clearAllData}
            className="text-xs text-black underline hover:text-gray-600 transition-colors"
            title="Clear all data"
          >
            Reset All
          </button>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">T-Shirt Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={snap.tshirtColor}
              onChange={handleColorChange}
              className="w-12 h-12 md:w-16 md:h-16 cursor-pointer rounded-lg border-2 border-gray-300 shadow-sm"
            />
            <span className="text-sm text-gray-600 font-mono truncate flex-1">
              {snap.tshirtColor}
            </span>
          </div>
        </div>

        {/* Decal Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Add Design</label>
          <input
            type="file"
            ref={decalFileInputRef}
            onChange={handleDecalUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => {
              decalFileInputRef.current?.click();
              if (isMobile) setMobileMenuOpen(false);
            }}
            className="w-full text-white bg-black font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:bg-gray-800 active:scale-95"
          >
            <Upload size={18} />
            Add Decal
          </button>
          {snap.decalTextures.length > 0 && (
            <p className="text-xs text-black mt-1">
              ✓ {snap.decalTextures.length} decal(s) saved
            </p>
          )}
        </div>
      </div>

      {/* Decal Controls Panel */}
      {showControls && snap.decalTextures.length > 0 && (
        <div className={`
          fixed z-10 bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl space-y-4 border border-gray-200
          ${isMobile 
            ? `bottom-4 left-4 right-4 p-4 max-h-[50vh] overflow-y-auto`
            : 'top-24 right-6 w-80 p-6'
          }
        `}>
          <div className="flex items-center justify-between">
            <h2 className={`font-semibold text-gray-800 ${isMobile ? 'text-base' : 'text-lg'}`}>
              Decal Controls
            </h2>
            <button
              onClick={() => setShowControls(false)}
              className="text-gray-400 hover:text-gray-600 text-xl transition-colors"
            >
              ×
            </button>
          </div>

          {/* Decal Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { state.activeDecalIndex = Math.max(0, snap.activeDecalIndex - 1); }}
              disabled={snap.activeDecalIndex === 0}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 text-gray-700 py-2 rounded-lg transition-all flex items-center justify-center active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-gray-600 px-3">
              {snap.activeDecalIndex + 1} / {snap.decalTextures.length}
            </span>
            <button
              onClick={() => { state.activeDecalIndex = Math.min(snap.decalTextures.length - 1, snap.activeDecalIndex + 1); }}
              disabled={snap.activeDecalIndex === snap.decalTextures.length - 1}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 text-gray-700 py-2 rounded-lg transition-all flex items-center justify-center active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => removeDecal(snap.decalTextures[snap.activeDecalIndex].id)}
              className="bg-black text-white p-2 rounded-lg transition-all flex items-center justify-center hover:bg-gray-800 active:scale-95"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Position Controls */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Position</label>
            <div className="space-y-2">
              {['X', 'Y', 'Z'].map((axis, index) => (
                <div key={axis} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 w-4">{axis}</span>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={activeDecal?.position[index] || 0}
                    onChange={(e) => handlePositionChange(index, e.target.value)}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <span className="text-xs font-mono text-gray-600 w-12 text-right">
                    {(activeDecal?.position[index] || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rotation Controls */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Rotation</label>
            <div className="space-y-2">
              {['X', 'Y', 'Z'].map((axis, index) => (
                <div key={axis} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 w-4">{axis}</span>
                  <input
                    type="range"
                    min="-3.14"
                    max="3.14"
                    step="0.01"
                    value={activeDecal?.rotation[index] || 0}
                    onChange={(e) => handleRotationChange(index, e.target.value)}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <span className="text-xs font-mono text-gray-600 w-12 text-right">
                    {(activeDecal?.rotation[index] || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scale Controls */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Scale</label>
            <div className="space-y-2">
              {['X', 'Y', 'Z'].map((axis, index) => (
                <div key={axis} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 w-4">{axis}</span>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.01"
                    value={activeDecal?.scale[index] || 0.15}
                    onChange={(e) => handleScaleChange(index, e.target.value)}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <span className="text-xs font-mono text-gray-600 w-12 text-right">
                    {(activeDecal?.scale[index] || 0.15).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toggle Controls Button (Desktop) */}
      {!isMobile && snap.decalTextures.length > 0 && !showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed top-24 right-6 z-10 bg-black text-white px-4 py-2 rounded-lg shadow-lg transition-all hover:bg-gray-800 active:scale-95"
        >
          Show Controls
        </button>
      )}

      {/* Toggle Controls Button (Mobile) */}
      {isMobile && snap.decalTextures.length > 0 && !showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed bottom-4 right-4 z-10 bg-black text-white p-3 rounded-full shadow-lg transition-all hover:bg-gray-800 active:scale-95"
        >
          <ChevronLeft size={20} className="rotate-90" />
        </button>
      )}

      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: [0, 0.5, 1.5] }}
        className="touch-none"
        
      >
        <OrbitControls 
          enablePan={false} 
          enableZoom={!isMobile}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
        <ambientLight intensity={2.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <Model 
          scale={isMobile ? 1.8 : 2} 
          tshirtColor={snap.tshirtColor}
          tshirtTexture={null}
          decals={snap.decalTextures}
          activeDecalIndex={snap.activeDecalIndex}
        />
      </Canvas>
    </div>
  );
}