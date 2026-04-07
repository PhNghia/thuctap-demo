export interface Label {
  id: string;
  name: string;
  imagePath?: string;
}

export interface Zone {
  id: string;
  correctLabelId: string;

  // % position
  x: number;
  y: number;
}

export interface DiagramData {
  id: string;
  name: string;

  imagePath?: string;

  labels: Label[];
  zones: Zone[];
}