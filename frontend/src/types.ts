export interface BaseComponent {
  id: string;
  name: string;
  type: 'shape' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

export interface ShapeComponent extends BaseComponent {
  type: 'shape';
  shapeType: 'rectangle' | 'circle';
  fillColorToken: string; // Terikat ke nama token, misal: 'primary'
  borderRadius: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
}

export interface TextComponent extends BaseComponent {
  type: 'text';
  textContent: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: 'normal' | 'italic';
  textColorToken: string; // Terikat ke nama token, misal: 'onPrimary'
  letterSpacing: number;
  lineHeight: number;
}

export type CanvasComponent = ShapeComponent | TextComponent;

export interface ColorToken {
  name: string;      // Contoh: 'primary', 'onPrimary', 'background'
  lightHex: string;  // Format: '#FFFFFF'
  darkHex: string;   // Format: '#121212'
}

export interface ColorPack {
  id: string;
  name: string;
  tokens: ColorToken[];
}

export interface Project {
  id: string;
  name: string;
  color_pack_id: string;
  color_pack?: ColorPack;
  canvas_state: CanvasComponent[];
  created_at: string;
  updated_at: string;
}
