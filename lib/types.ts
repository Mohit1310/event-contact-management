export type Event = {
  id: number;
  name: string;
};

export type Contact = {
  id: number;
  event_id: number;
  name: string;
  phone: string;
  note?: string | null;
};
