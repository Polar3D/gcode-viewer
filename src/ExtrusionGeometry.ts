/**
 * ExtrusionGeometry - Creates 3D tube geometry from a path of points
 * Creates a continuous tube mesh without per-segment end caps to prevent z-fighting
 * 
 * This implementation creates one ring of vertices per point and connects them with faces,
 * similar to TubeGeometry but optimized for 3D printing toolpaths.
 */
import { BufferGeometry, Float32BufferAttribute, Vector2, Vector3 } from 'three';

export interface ExtrusionGeometryParameters {
    points: Vector3[];
    lineWidth: number;
    lineHeight: number;
    radialSegments: number;
    closed: boolean;
}

export class ExtrusionGeometry extends BufferGeometry {
    parameters: ExtrusionGeometryParameters;

    override readonly type = 'ExtrusionGeometry';

    constructor(
        points: Vector3[] = [new Vector3()],
        lineWidth: number = 0.4,
        lineHeight: number = 0.2,
        radialSegments: number = 8
    ) {
        super();

        this.parameters = {
            points,
            lineWidth,
            lineHeight,
            radialSegments,
            closed: false
        };

        // Need at least 2 points
        if (points.length < 2) {
            return;
        }

        // Helper variables
        const vertex = new Vector3();
        const normal = new Vector3();
        const uv = new Vector2();

        // Buffers
        const vertices: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        const halfWidth = lineWidth / 2;
        const halfHeight = lineHeight / 2;

        // Generate buffer data
        generateBufferData();

        // Build geometry
        this.setIndex(indices);
        this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

        // Functions

        function generateBufferData(): void {
            // Generate a ring of vertices for each point
            for (let i = 0; i < points.length; i++) {
                generateSegment(i);
            }

            // Generate the last row of vertices at the end position
            generateSegment(points.length - 1);

            // Generate UVs
            generateUVs();

            // Generate face indices
            generateIndices();
        }

        function generateSegment(i: number): void {
            // Get the point position and compute tangent/normal/binormal frame
            const [P, N, B] = computeCornerAngles(i);

            // Generate vertices around the path in a ring
            for (let j = 0; j <= radialSegments; j++) {
                const v = (j / radialSegments) * Math.PI * 2;
                const sin = Math.sin(v);
                const cos = -Math.cos(v);

                // Normal direction
                normal.x = cos * N.x + sin * B.x;
                normal.y = cos * N.y + sin * B.y;
                normal.z = cos * N.z + sin * B.z;
                normal.normalize();
                normals.push(normal.x, normal.y, normal.z);

                // Vertex position - use lineWidth for X/Y, lineHeight for Z
                vertex.x = P.x + halfWidth * normal.x;
                vertex.y = P.y + halfWidth * normal.y;
                vertex.z = P.z + halfHeight * normal.z;
                vertices.push(vertex.x, vertex.y, vertex.z);
            }
        }

        function generateIndices(): void {
            // Connect adjacent rings with quad faces
            for (let j = 1; j < points.length; j++) {
                for (let i = 1; i <= radialSegments; i++) {
                    const a = (radialSegments + 1) * (j - 1) + (i - 1);
                    const b = (radialSegments + 1) * j + (i - 1);
                    const c = (radialSegments + 1) * j + i;
                    const d = (radialSegments + 1) * (j - 1) + i;

                    // Two triangles per quad
                    indices.push(a, b, d);
                    indices.push(b, c, d);
                }
            }
        }

        function generateUVs(): void {
            for (let i = 0; i < points.length; i++) {
                for (let j = 0; j <= radialSegments; j++) {
                    uv.x = i / points.length;
                    uv.y = j / radialSegments;
                    uvs.push(uv.x, uv.y);
                }
            }
        }

        function computeCornerAngles(i: number): [Vector3, Vector3, Vector3] {
            const P = points[i];
            const tangent = new Vector3();
            const N = new Vector3();
            const B = new Vector3();
            const vec = new Vector3();

            // Compute tangent from adjacent points
            // For middle points, average the incoming and outgoing directions
            // For end points, use the single available direction
            const prevPoint = points[i - 1] || P;
            const nextPoint = points[i + 1] || P;

            tangent
                .copy(P)
                .sub(prevPoint)
                .normalize()
                .add(nextPoint.clone().sub(P).normalize())
                .normalize();

            // If tangent is zero (identical points), default to Z-up
            if (tangent.lengthSq() < 0.001) {
                tangent.set(0, 0, 1);
            }

            // Calculate normal and binormal vectors using Frenet-Serret frame
            // Find the minimum component of tangent to get a perpendicular vector
            let min = Number.MAX_VALUE;
            const tx = Math.abs(tangent.x);
            const ty = Math.abs(tangent.y);
            const tz = Math.abs(tangent.z);

            if (tx <= min) {
                min = tx;
                N.set(1, 0, 0);
            }

            if (ty <= min) {
                min = ty;
                N.set(0, 1, 0);
            }

            if (tz <= min) {
                N.set(0, 0, 1);
            }

            // Compute orthonormal basis
            vec.crossVectors(tangent, N).normalize();
            N.crossVectors(tangent, vec);
            B.crossVectors(tangent, N);

            return [P, N, B];
        }
    }
}
