let previewBox = {
            id: 0,
            name: "preview-box",
            components: [
                {
                    props: {
                        geometry: {
                            shape: "node",
                            size: [1, 1, 1]
                        },
                        material: {
                            color: 0x808080,
                            name: "basic"
                        },
                        noRayCast: {}
                    },
                    quaternion: [ 0, 0, 0, 1 ],
                    position: [ 0, 0, 0],
                    components: []
                },
                {
                    props: {
                        geometry: {
                            shape: "box",
                            size: [1200, 12000, 12000]
                        },
                        material: {
                            color: 0xffffff,
                            name: "wireframe"
                        }
                    },
                    quaternion: null,
                    position: [ 6000, -10250, 0 ],
                    components: []
                },
                {
                    props: {
                        geometry: {
                            shape: "box",
                            size: [1200, 12000, 12000]
                        },
                        material: {
                            color: 0xffffff,
                            name: "wireframe"
                        }
                    },
                    quaternion: null,
                    position: [ -6000, -10250, 0 ],
                    components: []
                },
            ],
            position: [ 0, 0, 0 ],
            quaternion: [ 0, 0, 0, 1 ]
        }

export default previewBox