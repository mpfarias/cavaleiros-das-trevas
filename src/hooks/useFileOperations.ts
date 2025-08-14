import { useState, useCallback } from 'react';
import type { Ficha } from '../types';
import { FichaSchema } from '../types';
import { VALIDATION_MESSAGES } from '../constants/character';
import type { NotificationSeverity } from './useNotification';

interface FileOperationResult {
  success: boolean;
  message: string;
  severity: NotificationSeverity;
  data?: Ficha;
}

export const useFileOperations = () => {
  const [isLoading, setIsLoading] = useState(false);

  const saveToFile = useCallback((ficha: Ficha): FileOperationResult => {
    try {
      setIsLoading(true);
      
      // Salva no localStorage
      localStorage.setItem('cavaleiro:ficha', JSON.stringify(ficha));
      
      // Cria e baixa o arquivo
      const blob = new Blob([JSON.stringify(ficha, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ficha.nome.trim()}.cavaleiro.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      return {
        success: true,
        message: `${VALIDATION_MESSAGES.fileSaved.replace('Ficha de ${ficha.nome}', `Ficha de ${ficha.nome}`)}`,
        severity: 'success'
      };
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error);
      return {
        success: false,
        message: 'Erro ao salvar arquivo. Tente novamente.',
        severity: 'error'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFromFile = useCallback((file: File): Promise<FileOperationResult> => {
    return new Promise((resolve) => {
      setIsLoading(true);
      
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const rawData = String(reader.result || '{}');
          const parsedData = JSON.parse(rawData);
          
          // Valida os dados usando Zod
          const validatedData = FichaSchema.parse(parsedData);
          
          resolve({
            success: true,
            message: VALIDATION_MESSAGES.fileImported,
            severity: 'success',
            data: validatedData
          });
        } catch (error) {
          console.error('Erro ao importar arquivo:', error);
          let errorMessage: string = VALIDATION_MESSAGES.invalidFile;
          
          if (error instanceof SyntaxError) {
            errorMessage = 'Arquivo JSON inválido. Verifique a formatação.';
          } else if (error && typeof error === 'object' && 'issues' in error) {
            errorMessage = 'Estrutura de ficha inválida. Verifique se o arquivo é uma ficha válida.';
          }
          
          resolve({
            success: false,
            message: errorMessage,
            severity: 'error'
          });
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setIsLoading(false);
        resolve({
          success: false,
          message: 'Erro ao ler o arquivo. Tente novamente.',
          severity: 'error'
        });
      };

      reader.readAsText(file);
    });
  }, []);

  const loadFromLocalStorage = useCallback((): FileOperationResult => {
    try {
      setIsLoading(true);
      
      const savedData = localStorage.getItem('cavaleiro:ficha');
      if (!savedData) {
        return {
          success: false,
          message: 'Nenhuma ficha salva encontrada.',
          severity: 'info'
        };
      }

      const parsedData = JSON.parse(savedData);
      const validatedData = FichaSchema.parse(parsedData);

      return {
        success: true,
        message: 'Ficha carregada do dispositivo.',
        severity: 'success',
        data: validatedData
      };
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return {
        success: false,
        message: 'Erro ao carregar ficha salva. Dados podem estar corrompidos.',
        severity: 'error'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearLocalStorage = useCallback((): FileOperationResult => {
    try {
      localStorage.removeItem('cavaleiro:ficha');
      return {
        success: true,
        message: 'Dados locais removidos com sucesso.',
        severity: 'success'
      };
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
      return {
        success: false,
        message: 'Erro ao limpar dados salvos.',
        severity: 'error'
      };
    }
  }, []);

  return {
    isLoading,
    saveToFile,
    loadFromFile,
    loadFromLocalStorage,
    clearLocalStorage
  };
};
