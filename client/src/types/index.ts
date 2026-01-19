export interface Block {
    id: string;
    content: string;
    type: 'p' | 'h1' | 'h2' | 'h3' | 'ul';
    rank: string;
}

export type BlockType = Block['type'];

export interface DocState {
    blocks: Block[];
    title: string;
    header_note?: string;
    version: number;
}
