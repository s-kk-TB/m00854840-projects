import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {Html, useProgress, Environment } from '@react-three/drei';
import { Suspense } from 'react'; 

function Loader(){
    const { progress } = useProgress();
    return <Html center>{progress} % loaded</Html>
}

function RotateMask({ model, selectedMesh }) {
    const mask = model.scene;
    const speed = 0.0001;
    const expo = 1;
    let finalX = 0;
    
    useFrame(() => {
        let neg = sessionStorage.getItem("neg");
        let pos = sessionStorage.getItem("pos");
        let speed = 0.01;
        if(selectedMesh === 0){
            finalX = (-1) + ((neg/100) * expo);

            if(!(mask.rotation.x <= finalX + speed && mask.rotation.x >= finalX - speed)){
                if(mask.rotation.x < finalX){
                    mask.rotation.x += speed;
                    finalX += 0.3;
                }else if(mask.rotation.x > finalX){
                    mask.rotation.x -= speed;
                    finalX -= - 0.3;
                }
            }
        }
        if(selectedMesh === 1){
            finalX = (-1) + ((pos/100) ** expo);

            if(!(mask.rotation.x <= finalX + speed && mask.rotation.x >= finalX - speed)){
                if(mask.rotation.x < finalX){
                    mask.rotation.x += speed;
                }else if(mask.rotation.x > finalX){
                    mask.rotation.x -= speed;
                }
            }
        }
    })
    return null;
}

/* Display 3d models on front end */
export const Render3dObj = () => {
    const frown =  useLoader(GLTFLoader,'/3d/frown_mask.glb');
    const smile =  useLoader(GLTFLoader,'/3d/smile_mask.glb');

    return(
        <Canvas camera={{ 
            position: [0,-1,5], 
            rotation: [0.175,0,0]
            }}>
            <Suspense fallback={<Loader />}>

                {/* Handle mesh interaction with sentiment */}
                <RotateMask model={frown} selectedMesh={0} />
                <primitive object={frown.scene}
                    rotation = {[ -1, 0, 0 ]}
                    position = {[ -2, 0, 0 ]}
                />
                <RotateMask model={smile} selectedMesh={1} />
                <primitive object={smile.scene}
                    rotation={[-1, 0, 0]}
                    position = {[ 1, 0, 0 ]}
                />
                <Environment files="/3d/preller_drive_1k.hdr" />
            </Suspense>
        </Canvas>
    )
};