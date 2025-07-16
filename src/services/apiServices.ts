// src/services/apiService.tsx

// Define a URL base da sua API.
const API_BASE_URL = "https://api-matheus-quantumm.onrender.com"; // Ou process.env.REACT_APP_API_BASE_URL;

// --- Interfaces de Tipagem para os Dados da API ---

interface PrevisaoDia {
  data: string; // Ex: "YYYY-MM-DD"
  previsao_kg: number;
  limite_inferior_kg: number;
  limite_superior_kg: number;
}

export interface DemandInfoResponse {
  id_produto: number;
  data_consulta: string; // Ex: "YYYY-MM-DD"
  qtd_a_retirar_hoje_kg: number;
  qtd_em_descongelamento_kg: number;
  qtd_disponivel_para_venda_hoje_kg: number;
  previsao_proximos_dias: PrevisaoDia[];
  mape: string; // Ex: "15.23%"
  rmse: string; // Ex: "10.50"
}

// --- Função de Serviço de API com Tipagem ---

/**
 * Busca as informações de demanda e otimização de descongelamento para um produto específico.
 * @param productId O ID do produto a ser consultado.
 * @returns Os dados de demanda do produto.
 * @throws {Error} Se a requisição à API falhar ou retornar um status de erro.
 */
export async function getDemandInfo(productId: number): Promise<DemandInfoResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/demand_info/${productId}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao buscar dados da API: ${response.status} - ${errorText || 'Resposta vazia'}`);
    }

    const data: DemandInfoResponse = await response.json();
    return data;
  } catch (error: unknown) { // <-- MUDANÇA AQUI: de 'any' para 'unknown'
    console.error("Erro no serviço de API (getDemandInfo):", error);

    // MUDANÇA AQUI: Verifica se o erro é uma instância de Error para acessar .message
    let errorMessage = "Ocorreu um erro desconhecido.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    throw new Error(`Falha na comunicação com a API: ${errorMessage}`);
  }
}