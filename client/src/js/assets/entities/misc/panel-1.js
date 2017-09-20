let panel1 = {
        id: 0,
        name: "panel1",
        components: [
            {
                props: {
                    geometry: {
                        merge: true,
                        shape: "box",
                        size: [ 1.1, 1.1, 0.06 ]
                    },
                    material: {
                        color: 0x808080,
                        name: "plastic"
                    }
                },
                quaternion: [ 0, 0, 0, 1 ],
                position: [ -4625, 0, 0 ],
                components: []
            },
            {
                props: {
                    geometry: {
                        merge: true,
                        shape: "box",
                        size: [ 1.2, 1.2, 0.5 ]
                    },
                    material: {
                        color: 0x808080,
                        name: "hard-light"
                    }
                },
                quaternion: [ 0, 0, 0, 1 ],
                position: [ 0.333, 0, 0 ],
                components: []
            },
            
        ],
        position: [ 0, 0, 0 ],
        quaternion: [ 0, 0, 0, 1 ]
    }

export default panel1