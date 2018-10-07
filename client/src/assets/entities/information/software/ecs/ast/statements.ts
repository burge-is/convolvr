import { DBComponent } from "../../../../../../core/component";

export default class ASTStatements {
    public static AssignmentStatement =  {
        id: -1,
        name: "ast-AssignmentStatement",
        components: [{
            attrs: {
                geometry: {
                    shape: "box",
                    size: [ 2, 4, 2 ]
                },
                material: {
                    color: 0x20ff20,
                    name: "metal"
                },
                text: {
                    lines: ["="],
                    color: "#20ff20",
                    background: "#000000"
                }
            },
            quaternion: [ 0, 0, 0, 1 ],
            position: [ 0, 0, 0 ],
            components: ([] as DBComponent[]),
        } as DBComponent],
        position: [ 0, 0, 0 ],
        quaternion: [ 0, 0, 0, 1 ]
    };

    public static LetStatement =  {
        id: -1,
        name: "ast-LetStatement",
        components: [{
            attrs: {
                geometry: {
                    shape: "box",
                    size: [ 2, 4, 2 ]
                },
                material: {
                    color: 0x20ff20,
                    name: "metal"
                },
                text: {
                    lines: ["let"],
                    color: "#20ff20",
                    background: "#000000"
                }
            },
            quaternion: [ 0, 0, 0, 1 ],
            position: [ 0, 0, 0 ],
            components: ([] as DBComponent[]),
        } as DBComponent],
        position: [ 0, 0, 0 ],
        quaternion: [ 0, 0, 0, 1 ]
    };

    public static ClassStatement =  {
        id: -1,
        name: "ast-ClassStatement",
        components: [{
            attrs: {
                geometry: {
                    shape: "box",
                    size: [ 2, 4, 2 ]
                },
                material: {
                    color: 0x20ff20,
                    name: "metal"
                },
                text: {
                    lines: ["class"],
                    color: "#20ff20",
                    background: "#000000"
                }
            },
            quaternion: [ 0, 0, 0, 1 ],
            position: [ 0, 0, 0 ],
            components: ([] as DBComponent[]),
        } as DBComponent],
        position: [ 0, 0, 0 ],
        quaternion: [ 0, 0, 0, 1 ]
    };

    public static ReturnStatement =  {
        id: -1,
        name: "ast-ReturnStatement",
        components: [{
            attrs: {
                geometry: {
                    shape: "box",
                    size: [ 2, 4, 2 ]
                },
                material: {
                    color: 0x20ff20,
                    name: "metal"
                },
                text: {
                    lines: ["return"],
                    color: "#20ff20",
                    background: "#000000"
                }
            },
            quaternion: [ 0, 0, 0, 1 ],
            position: [ 0, 0, 0 ],
            components: ([] as DBComponent[]),
        } as DBComponent],
        position: [ 0, 0, 0 ],
        quaternion: [ 0, 0, 0, 1 ]
    };

    public static ExpressionStatement =  {
        id: -1,
        name: "ast-ExpressionStatement",
        components: [{
            attrs: {
                geometry: {
                    shape: "box",
                    size: [ 2, 4, 2 ]
                },
                material: {
                    color: 0x20ff20,
                    name: "metal"
                },
                text: {
                    lines: ["( Expression )"],
                    color: "#20ff20",
                    background: "#000000"
                }
            },
            quaternion: [ 0, 0, 0, 1 ],
            position: [ 0, 0, 0 ],
            components: ([] as DBComponent[]),
        } as DBComponent],
        position: [ 0, 0, 0 ],
        quaternion: [ 0, 0, 0, 1 ]
    };

    public static BlockStatement =  {
        id: -1,
        name: "ast-BlockStatement",
        components: [{
            attrs: {
                geometry: {
                    shape: "box",
                    size: [ 2, 4, 2 ]
                },
                material: {
                    color: 0x20ff20,
                    name: "metal"
                },
                text: {
                    lines: ["{ Block }"],
                    color: "#20ff20",
                    background: "#000000"
                }
            },
            quaternion: [ 0, 0, 0, 1 ],
            position: [ 0, 0, 0 ],
            components: ([] as DBComponent[]),
        } as DBComponent],
        position: [ 0, 0, 0 ],
        quaternion: [ 0, 0, 0, 1 ]
    };
}