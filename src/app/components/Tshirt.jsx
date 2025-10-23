import React, { useMemo } from 'react';
import { useGLTF, useTexture, Decal } from '@react-three/drei';

export function Model({ 
  tshirtColor = '#ffffff', 
  tshirtTexture = null,
  decals = [],
  activeDecalIndex = 0,
  ...props 
}) {
  const { nodes, materials } = useGLTF('/models/tshirt.glb');
  
  // Always call useTexture hooks unconditionally
  const textureUrls = useMemo(() => {
    const urls = [];
    if (tshirtTexture) urls.push(tshirtTexture);
    decals.forEach(decal => {
      if (decal.texture) urls.push(decal.texture);
    });
    return urls;
  }, [tshirtTexture, decals]);
  
  // This will always be called with the same number of URLs
  const textures = useTexture(textureUrls);
  
  // Extract the tshirt texture and decal textures from the loaded textures
  const tshirtMap = tshirtTexture ? textures[0] : null;
  const decalTextures = useMemo(() => {
    if (!tshirtTexture) return textures;
    return textures.slice(1);
  }, [textures, tshirtTexture]);

  return (
    <group {...props} dispose={null}>
      <mesh 
        castShadow
        receiveShadow
        geometry={nodes.T_Shirt_male.geometry}
      >
        <meshStandardMaterial 
          {...materials.lambert1} 
          color={tshirtColor}
          map={tshirtMap}
          metalness={0.1}
          roughness={0.8}
        />
        
        {/* Render all decals */}
        {decals.map((decal, index) => (
          <Decal
            key={decal.id}
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
            polygonOffset
            polygonOffsetFactor={-1}
          >
            <meshBasicMaterial
              map={decalTextures[index]}
              transparent
              polygonOffset
              polygonOffsetFactor={-1}
              opacity={index === activeDecalIndex ? 1 : 0.7}
            />
          </Decal>
        ))}
      </mesh>
    </group>
  );
}

// Preload the model
useGLTF.preload('/models/tshirt.glb');