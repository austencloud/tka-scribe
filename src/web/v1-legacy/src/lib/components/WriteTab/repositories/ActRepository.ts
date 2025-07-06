import type { Act } from '../models/Act';
import { browser } from '$app/environment';

/**
 * Repository for Act persistence operations
 */
export class ActRepository {
  private static STORAGE_KEY = 'current_act';
  
  /**
   * Load an act from localStorage
   */
  static loadAct(): Act | null {
    if (!browser) return null;
    
    try {
      const savedAct = localStorage.getItem(this.STORAGE_KEY);
      return savedAct ? JSON.parse(savedAct) : null;
    } catch (error) {
      console.error('Failed to load act:', error);
      return null;
    }
  }
  
  /**
   * Save an act to localStorage
   */
  static saveAct(act: Act): boolean {
    if (!browser) return false;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(act));
      return true;
    } catch (error) {
      console.error('Failed to save act:', error);
      return false;
    }
  }
  
  /**
   * Delete an act from localStorage
   */
  static deleteAct(): boolean {
    if (!browser) return false;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to delete act:', error);
      return false;
    }
  }
  
  /**
   * Export an act to a JSON file for download
   */
  static exportAct(act: Act, filename: string = 'act.json'): void {
    if (!browser) return;
    
    try {
      const json = JSON.stringify(act, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Failed to export act:', error);
    }
  }
  
  /**
   * Import an act from a JSON file
   */
  static importAct(file: File): Promise<Act> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const json = event.target?.result as string;
          const act = JSON.parse(json) as Act;
          resolve(act);
        } catch (error) {
          reject(new Error('Invalid act file format'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }
}
