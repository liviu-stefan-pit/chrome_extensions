export type ViewType = 'schedule' | 'browse' | 'favorites';

export interface UIState {
  currentView: ViewType;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: any[];
  isSearching: boolean;
}

export interface ModalState {
  isOpen: boolean;
  animeId: number | null;
}
