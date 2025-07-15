import React, { useState, useEffect } from "react";
import { Truck, Snowflake, Package, TrendingUp } from "lucide-react"; // Verifique se lucide-react está instalado
import { MetricCard } from "@/components/MetricCard"; // Ajuste o caminho real dos seus componentes
import { ProcessTimeline } from "@/components/ProcessTimeline"; // Ajuste o caminho real
import { DashboardHeader } from "@/components/DashboardHeader"; // Ajuste o caminho real

// Importa a função de consumo da API
import { getDemandInfo } from "@/services/apiServices"; // <-- MUITO IMPORTANTE: Ajuste este caminho conforme sua estrutura de pastas

export function Dashboard() {
  const productId = 237478; // TODO: Você pode tornar este ID dinâmico (ex: de um parâmetro de URL)
  const [demandData, setDemandData] = useState(null); // Estado para armazenar os dados da API
  const [loading, setLoading] = useState(true); // Estado para controlar o estado de carregamento
  const [error, setError] = useState(null); // Estado para armazenar mensagens de erro

  // Dados que não são fornecidos pela API e podem ser mantidos mockados ou vir de outra fonte
  const employeeName = "João Silva";
  const notificationsCount = 1;

  // Formatação da data atual para o cabeçalho
  const currentDateFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Efeito para buscar os dados da API quando o componente é montado ou o productId muda
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Inicia o carregamento
        setError(null); // Limpa erros anteriores

        // Chama a função do serviço de API para obter os dados reais
        const data = await getDemandInfo(productId);
        setDemandData(data); // Atualiza o estado com os dados recebidos da API

      } catch (err) {
        // Captura e armazena qualquer erro que ocorra durante a busca
        setError(err.message);
        console.error("Erro ao buscar dados no Dashboard:", err);
      } finally {
        setLoading(false); // Finaliza o carregamento, independentemente de sucesso ou erro
      }
    };

    fetchData(); // Chama a função de busca
  }, [productId]); // A dependência productId faz com que o efeito seja re-executado se o ID mudar

  // --- Lógica de Renderização Condicional ---
  // Exibe mensagem de carregamento enquanto os dados estão sendo buscados
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <p className="text-foreground text-xl">Carregando dados do dashboard...</p>
      </div>
    );
  }

  // Exibe mensagem de erro se a busca de dados falhar
  if (error) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center p-8">
        <div className="text-red-600 p-6 bg-red-100 border border-red-400 rounded-lg shadow-md max-w-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Erro ao Carregar Dashboard</h2>
          <p className="mb-2">Ocorreu um erro ao buscar as informações da API:</p>
          <p className="font-mono text-sm break-words">{error}</p>
          <p className="mt-4 text-gray-700">
            Por favor, verifique se a API Python está rodando e acessível em <code className="font-semibold">http://localhost:8000</code>.
          </p>
          <p className="text-gray-700">
            Você pode tentar um ID de produto diferente ou recarregar a página.
          </p>
        </div>
      </div>
    );
  }

  // Exibe mensagem se não houver dados após o carregamento (ex: ID de produto não encontrado)
  if (!demandData) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <p className="text-foreground text-xl">Nenhum dado de demanda disponível para o produto {productId}.</p>
      </div>
    );
  }

  // --- Mapeamento de dados da API para a timeline (ProcessTimeline) ---
  // Limita a 6 estágios para a timeline e mapeia os dados da previsão da API
  const timelineStages = demandData.previsao_proximos_dias.slice(0, 6).map((item, index) => {
    let stageName = "";
    let status = "pending";
    if (index === 0) { // O primeiro dia da previsão é "disponível"
      stageName = "Disponível (Previsão)";
      status = "current";
    } else if (index === 1) { // O segundo dia da previsão é "em descongelamento" (se sua lógica for D+1)
      stageName = "Descongelamento (Previsão)";
    } else if (index === 2) { // O terceiro dia da previsão é "retirada" (se sua lógica for D+2)
      stageName = "Retirada (Previsão)";
    } else {
      stageName = "Previsão Futura";
    }

    return {
      day: index + 1,
      stage: stageName,
      amount: item.previsao_kg, // Usa o valor da previsão da API
      status: status,
      date: item.data // Adiciona a data da previsão para referência
    };
  });

  // --- Renderização do Dashboard com os dados da API ---
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        employeeName={employeeName}
        currentDate={currentDateFormatted}
        notifications={notificationsCount}
      />
      
      <main className="px-6 py-8">
        {/* Métricas principais - Valores vêm diretamente de 'demandData' da API */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Quantidade para Retirada Hoje"
            value={demandData.qtd_a_retirar_hoje_kg} // <-- Valor real da API
            unit="kg"
            icon={Truck}
            variant="primary"
            trend={demandData.mape ? parseFloat(demandData.mape.replace('%', '')) : 0} // Exemplo de uso de MAPE
            subtitle={`MAPE: ${demandData.mape}`}
          />
          
          <MetricCard
            title="Em Descongelamento"
            value={demandData.qtd_em_descongelamento_kg} // <-- Valor real da API
            unit="kg"
            icon={Snowflake}
            variant="accent"
            trend={demandData.rmse ? parseFloat(demandData.rmse) : 0} // Exemplo de uso de RMSE
            subtitle={`RMSE: ${demandData.rmse}`}
          />
          
          <MetricCard
            title="Disponível Hoje"
            value={demandData.qtd_disponivel_para_venda_hoje_kg} // <-- Valor real da API
            unit="kg"
            icon={Package}
            variant="success"
            // O valor 'trend' abaixo é mockado, pois não vem da API de previsão de demanda
            trend={12.3} 
            subtitle="Pronto para distribuição"
          />
        </div>

        {/* Cards informativos adicionais - Estes ainda usam dados mockados */}
        {/* Se você precisar que estes dados sejam dinâmicos, sua API Python precisará ser expandida para calculá-los e fornecê-los. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 shadow-medium border border-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Resumo Semanal
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total processado esta semana:</span>
                <span className="font-medium text-foreground">1,247.5 kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Média diária:</span>
                <span className="font-medium text-foreground">178.2 kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Eficiência:</span>
                <span className="font-medium text-success">96.8%</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-medium border border-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-warning rounded-full flex items-center justify-center">
                <Package className="h-4 w-4 text-warning-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Status do Estoque
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Estoque total:</span>
                <span className="font-medium text-foreground">2,456.8 kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Em processo:</span>
                <span className="font-medium text-foreground">312.7 kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Nível de alerta:</span>
                <span className="font-medium text-success">Normal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline do processo - Stages vêm da previsão da API */}
        <ProcessTimeline 
          currentDay={1} // Pode ser ajustado conforme a lógica do seu componente ProcessTimeline
          stages={timelineStages} // <-- Usa os estágios mapeados da previsão da API
        />
      </main>
    </div>
  );
}