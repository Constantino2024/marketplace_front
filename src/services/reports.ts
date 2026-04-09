import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { Order } from './orders';
import { getCurrentUser } from './auth';

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  company?: string;
}

export const reportsService = {
  // Gerar PDF com relatório de pedidos
  generatePDF: (orders: Order[], filters?: ReportFilters) => {
    const user = getCurrentUser();
    const isCompany = user?.is_company;
    const companyName = isCompany ? user?.company?.company_name : 'HSE Marketplace';
    
    // Criar novo documento PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Título do relatório
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185); // Azul primário
    doc.text('Relatório de Pedidos', pageWidth / 2, 20, { align: 'center' });
    
    // Nome da empresa
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(companyName || 'HSE Marketplace', pageWidth / 2, 30, { align: 'center' });
    
    // Data de geração
    const today = new Date().toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Gerado em: ${today}`, pageWidth / 2, 38, { align: 'center' });
    
    // Filtros aplicados
    let yPos = 45;
    if (filters) {
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      
      if (filters.startDate && filters.endDate) {
        doc.text(
          `Período: ${filters.startDate.toLocaleDateString('pt-PT')} - ${filters.endDate.toLocaleDateString('pt-PT')}`,
          14,
          yPos
        );
        yPos += 5;
      }
      
      if (filters.status) {
        const statusMap: Record<string, string> = {
          'pending': 'Pendente',
          'paid': 'Pago',
          'shipped': 'Enviado',
          'delivered': 'Entregue',
          'cancelled': 'Cancelado'
        };
        doc.text(`Status: ${statusMap[filters.status] || filters.status}`, 14, yPos);
        yPos += 5;
      }
    }
    
    // Resumo estatístico
    const totalOrders = orders.length;
    const totalValue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const paidOrders = orders.filter(o => o.status === 'paid').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de Pedidos: ${totalOrders}`, 14, yPos + 5);
    doc.text(`Valor Total: Kz ${totalValue.toLocaleString()}`, 14, yPos + 12);
    doc.text(`Pagos: ${paidOrders} | Pendentes: ${pendingOrders}`, 14, yPos + 19);
    
    // Tabela de pedidos
    const tableData = orders.map(order => {
      const customerName = order.customer_info?.full_name || order.customer || '—';
      const orderDate = new Date(order.date).toLocaleDateString('pt-PT');
      const statusMap: Record<string, string> = {
        'pending': 'Pendente',
        'paid': 'Pago',
        'shipped': 'Enviado',
        'delivered': 'Entregue',
        'cancelled': 'Cancelado'
      };
      
      return [
        order.order_number,
        customerName,
        order.company || 'Loja Geral',
        orderDate,
        `Kz ${Number(order.total || 0).toLocaleString()}`,
        statusMap[order.status] || order.status
      ];
    });
    
    autoTable(doc, {
      head: [['ID Pedido', 'Cliente', 'Empresa', 'Data', 'Total', 'Status']],
      body: tableData,
      startY: yPos + 25,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 25 },
      },
      didDrawPage: (data) => {
        // Rodapé com número da página
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Página ${i} de ${pageCount}`,
            pageWidth - 20,
            doc.internal.pageSize.getHeight() - 10
          );
        }
      },
    });
    
    // Salvar o PDF
    const fileName = `relatorio_pedidos_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  },

  // Gerar CSV com relatório de pedidos
  generateCSV: (orders: Order[], filters?: ReportFilters) => {
    const user = getCurrentUser();
    const isCompany = user?.is_company;
    const companyName = isCompany ? user?.company?.company_name : 'HSE Marketplace';
    
    // Preparar dados para CSV
    const csvData = orders.map(order => {
      const statusMap: Record<string, string> = {
        'pending': 'Pendente',
        'paid': 'Pago',
        'shipped': 'Enviado',
        'delivered': 'Entregue',
        'cancelled': 'Cancelado'
      };
      
      const items = order.items?.map(item => 
        `${item.product_name} (${item.quantity}x Kz ${Number(item.price).toLocaleString()})`
      ).join('; ') || '';
      
      return {
        'ID Pedido': order.order_number,
        'Cliente': order.customer_info?.full_name || order.customer || '—',
        'Email': order.customer_info?.email || order.email || '—',
        'Telefone': order.customer_info?.phone || order.phone || '—',
        'Endereço': order.customer_info?.address || order.address || '—',
        'Cidade': order.customer_info?.city || '—',
        'Empresa': order.company || 'Loja Geral',
        'Data': new Date(order.date).toLocaleDateString('pt-PT'),
        'Total (Kz)': Number(order.total || 0).toLocaleString(),
        'Status': statusMap[order.status] || order.status,
        'Método Pagamento': order.customer_info?.payment_method === 'reference' ? 'Multicaixa' :
                            order.customer_info?.payment_method === 'card' ? 'Cartão' :
                            order.customer_info?.payment_method === 'cash' ? 'Dinheiro' : '—',
        'Itens': items
      };
    });
    
    // Adicionar linha de resumo
    const totalValue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    csvData.push({
      'ID Pedido': 'TOTAL GERAL',
      'Cliente': '',
      'Email': '',
      'Telefone': '',
      'Endereço': '',
      'Cidade': '',
      'Empresa': '',
      'Data': '',
      'Total (Kz)': totalValue.toLocaleString(),
      'Status': '',
      'Método Pagamento': '',
      'Itens': ''
    } as any);
    
    // Converter para CSV
    const csv = Papa.unparse(csvData, {
      delimiter: ';',
      header: true,
    });
    
    // Adicionar cabeçalho com informações do relatório
    const today = new Date().toLocaleDateString('pt-PT');
    const header = `Relatório de Pedidos - ${companyName}\nGerado em: ${today}\nTotal de Pedidos: ${orders.length}\nValor Total: Kz ${totalValue.toLocaleString()}\n\n`;
    
    // Criar e baixar o arquivo
    const blob = new Blob(['\uFEFF' + header + csv], { type: 'text/csv;charset=utf-8;' }); // \uFEFF para UTF-8 com BOM
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `relatorio_pedidos_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Gerar PDF para um único pedido (fatura)
  generateInvoicePDF: (order: Order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Cabeçalho da fatura
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185);
    doc.text('FATURA', pageWidth / 2, 20, { align: 'center' });
    
    // Número da fatura
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fatura Nº ${order.order_number}`, pageWidth / 2, 30, { align: 'center' });
    
    // Data
    const orderDate = new Date(order.date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFontSize(10);
    doc.text(`Data: ${orderDate}`, pageWidth / 2, 38, { align: 'center' });
    
    // Informações do cliente
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('DADOS DO CLIENTE', 14, 50);
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const customerName = order.customer_info?.full_name || order.customer || '—';
    const customerEmail = order.customer_info?.email || order.email || '—';
    const customerPhone = order.customer_info?.phone || order.phone || '—';
    const customerAddress = order.customer_info?.address || order.address || '—';
    const customerCity = order.customer_info?.city || '';
    
    doc.text(`Nome: ${customerName}`, 14, 58);
    doc.text(`Email: ${customerEmail}`, 14, 65);
    doc.text(`Telefone: ${customerPhone}`, 14, 72);
    doc.text(`Endereço: ${customerAddress}${customerCity ? `, ${customerCity}` : ''}`, 14, 79);
    
    // Tabela de itens
    const tableData = order.items?.map(item => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const total = quantity * price;
      
      return [
        item.product_name || 'Produto',
        quantity.toString(),
        `Kz ${price.toLocaleString()}`,
        `Kz ${total.toLocaleString()}`
      ];
    }) || [];
    
    autoTable(doc, {
      head: [['Produto', 'Qtd', 'Preço Unit.', 'Total']],
      body: tableData,
      startY: 90,
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
      },
      foot: [[
        'TOTAL',
        '',
        '',
        `Kz ${Number(order.total || 0).toLocaleString()}`
      ]],
      footStyles: {
        fillColor: [245, 245, 245],
        textColor: [41, 128, 185],
        fontStyle: 'bold',
        fontSize: 10,
      },
    });
    
    // Informações de pagamento
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('INFORMAÇÕES DE PAGAMENTO', 14, finalY);
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const paymentMethod = order.customer_info?.payment_method === 'reference' ? 'Multicaixa Express' :
                         order.customer_info?.payment_method === 'card' ? 'Cartão de Crédito' :
                         order.customer_info?.payment_method === 'cash' ? 'Pagamento na Entrega' : '—';
    
    doc.text(`Método de Pagamento: ${paymentMethod}`, 14, finalY + 7);
    doc.text(`Status do Pagamento: ${order.status === 'paid' ? 'PAGO' : 'PENDENTE'}`, 14, finalY + 14);
    
    // Rodapé
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Esta fatura é um documento oficial.', pageWidth / 2, finalY + 30, { align: 'center' });
    doc.text('Obrigado pela sua compra!', pageWidth / 2, finalY + 37, { align: 'center' });
    
    // Salvar o PDF
    const fileName = `fatura_${order.order_number}.pdf`;
    doc.save(fileName);
  }
};