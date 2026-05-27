import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Order } from './orders';

export interface ReceiptData {
  order: Order;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  paymentReference?: string;
  paymentMethod: string;
}

export const receiptService = {
  // Gerar PDF do recibo
  generateReceiptPDF: async (receiptData: ReceiptData): Promise<void> => {
    try {
      // Criar um elemento temporário para o recibo
      const receiptElement = document.createElement('div');
      receiptElement.innerHTML = receiptService.generateReceiptHTML(receiptData);
      receiptElement.style.position = 'absolute';
      receiptElement.style.left = '-9999px';
      receiptElement.style.top = '-9999px';
      document.body.appendChild(receiptElement);

      // Aguardar imagens carregarem
      await Promise.all(
        Array.from(receiptElement.getElementsByTagName('img')).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve(true);
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
            })
        )
      );

      // Gerar canvas
      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: false,
        useCORS: true,
        windowWidth: 800,
      });

      // Remover elemento temporário
      document.body.removeChild(receiptElement);

      // Criar PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`fatura-${receiptData.order.order_number}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:');
      throw error;
    }
  },

  // Gerar HTML do recibo
  generateReceiptHTML: (data: ReceiptData): string => {
    const { order, customerInfo, paymentReference, paymentMethod } = data;
    const date = new Date(order.created_at);
    const formattedDate = date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const statusColor = order.status === 'pending' ? '#ef4444' : '#10b981';
    const statusText = order.status === 'pending' ? 'PENDENTE' : 'PAGO';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Fatura ${order.order_number}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            background: #ffffff;
            padding: 30px;
            width: 800px;
            margin: 0 auto;
          }
          
          .receipt {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            padding: 30px;
            color: white;
          }
          
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .logo {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .logo img {
            height: 50px;
            width: auto;
          }
          
          .logo h1 {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: white;
          }
          
          .receipt-title {
            text-align: right;
          }
          
          .receipt-title h2 {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 5px;
          }
          
          .receipt-title p {
            font-size: 14px;
            opacity: 0.8;
          }
          
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.5px;
            background-color: ${statusColor}20;
            color: ${statusColor};
            border: 1px solid ${statusColor}40;
          }
          
          .info-section {
            padding: 30px;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
          }
          
          .info-block {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
          }
          
          .info-block h3 {
            font-size: 14px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
          }
          
          .info-item {
            margin-bottom: 10px;
          }
          
          .info-item .label {
            font-size: 12px;
            color: #94a3b8;
            margin-bottom: 2px;
          }
          
          .info-item .value {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
          }
          
          .reference-number {
            background: #1e293b;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 2px;
            text-align: center;
            margin-top: 15px;
          }
          
          .products-section {
            padding: 30px;
          }
          
          .products-section h3 {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 20px;
          }
          
          .product-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .product-table th {
            text-align: left;
            padding: 12px 10px;
            background: #f1f5f9;
            font-size: 12px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .product-table td {
            padding: 15px 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .product-item {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .product-image {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            background: #f8fafc;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          
          .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .product-details h4 {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 4px;
          }
          
          .product-details p {
            font-size: 13px;
            color: #64748b;
          }
          
          .product-price {
            font-weight: 700;
            color: #1e293b;
          }
          
          .product-total {
            font-weight: 800;
            color: #0f172a;
          }
          
          .summary-section {
            background: #f8fafc;
            padding: 30px;
            border-top: 2px solid #e2e8f0;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 16px;
          }
          
          .summary-row.total {
            font-size: 22px;
            font-weight: 800;
            color: #1e293b;
            border-top: 2px solid #cbd5e1;
            margin-top: 10px;
            padding-top: 15px;
          }
          
          .summary-row.total .amount {
            color: #f97316;
          }
          
          .footer {
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #94a3b8;
          }
          
          .payment-info {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding: 20px;
            background: #f1f5f9;
            border-radius: 10px;
          }
          
          .payment-info-item {
            text-align: center;
            flex: 1;
          }
          
          .payment-info-item .label {
            font-size: 11px;
            color: #64748b;
            margin-bottom: 5px;
          }
          
          .payment-info-item .value {
            font-size: 14px;
            font-weight: 700;
            color: #1e293b;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <!-- Header -->
          <div class="header">
            <div class="header-content">
              <div class="logo">
                <img 
                  src="https://caluloglobal.ao/img/Market_Place1.webp" 
                  alt="HSE MarketPlace"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                />
                <div style="display: none; width: 50px; height: 50px; background: #f97316; border-radius: 10px;"></div>
                <h1>HSE MarketPlace</h1>
              </div>
              <div class="receipt-title">
                <h2>FATURA</h2>
                <p>Nº ${order.order_number}</p>
              </div>
            </div>
          </div>

          <!-- Status e Datas -->
          <div class="info-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <span class="status-badge">${statusText}</span>
              <div style="font-size: 14px; color: #64748b;">
                <span>Data: ${formattedDate} | Hora: ${formattedTime}</span>
              </div>
            </div>

            <div class="info-grid">
              <!-- Cliente -->
              <div class="info-block">
                <h3>Dados do Cliente</h3>
                <div class="info-item">
                  <div class="label">Nome</div>
                  <div class="value">${customerInfo.fullName}</div>
                </div>
                <div class="info-item">
                  <div class="label">Email</div>
                  <div class="value">${customerInfo.email}</div>
                </div>
                <div class="info-item">
                  <div class="label">Telefone</div>
                  <div class="value">${customerInfo.phone}</div>
                </div>
                <div class="info-item">
                  <div class="label">Endereço</div>
                  <div class="value">${customerInfo.address}, ${customerInfo.city}</div>
                </div>
              </div>

              <!-- Pagamento -->
              <div class="info-block">
                <h3>Informações de Pagamento</h3>
                <div class="info-item">
                  <div class="label">Método</div>
                  <div class="value">${paymentMethod === 'reference' ? 'Referência Multicaixa' : 'Multicaixa Express'}</div>
                </div>
                ${paymentReference ? `
                <div class="info-item">
                  <div class="label">Referência</div>
                  <div class="reference-number">${paymentReference}</div>
                </div>
                ` : ''}
                <div class="info-item">
                  <div class="label">Nº do Pedido</div>
                  <div class="value" style="font-family: monospace;">${order.order_number}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Produtos -->
          <div class="products-section">
            <h3>Produtos</h3>
            <table class="product-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Preço Unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                <tr>
                  <td>
                    <div class="product-item">
                      <div class="product-image">
                        ${item.product_image ? 
                          `<img src="${item.product_image}" alt="${item.product_name}" />` : 
                          `<div style="width: 100%; height: 100%; background: #e2e8f0; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 20px;">📦</span>
                          </div>`
                        }
                      </div>
                      <div class="product-details">
                        <h4>${item.product_name || 'Produto'}</h4>
                        <p>${item.company_name || 'Loja Geral'}</p>
                      </div>
                    </div>
                  </td>
                  <td class="product-price">${item.quantity}x</td>
                  <td class="product-price">Kz ${Number(item.price).toLocaleString()}</td>
                  <td class="product-total">Kz ${(item.quantity * Number(item.price)).toLocaleString()}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Resumo -->
          <div class="summary-section">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>Kz ${order.total.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>Taxa de Entrega</span>
              <span style="color: #10b981;">Grátis</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span class="amount">Kz ${order.total.toLocaleString()}</span>
            </div>

            <div class="payment-info">
              <div class="payment-info-item">
                <div class="label">Forma de Pagamento</div>
                <div class="value">${paymentMethod === 'reference' ? 'Referência' : 'Multicaixa Express'}</div>
              </div>
              <div class="payment-info-item">
                <div class="label">Data de Emissão</div>
                <div class="value">${formattedDate}</div>
              </div>
              <div class="payment-info-item">
                <div class="label">Status</div>
                <div class="value" style="color: ${statusColor};">${statusText}</div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Esta fatura é um documento válido para fins fiscais.</p>
            <p style="margin-top: 5px;">HSE MarketPlace - Todos os direitos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Imprimir recibo
  printReceipt: (data: ReceiptData): void => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = receiptService.generateReceiptHTML(data);
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  },

  // Baixar como HTML (alternativa)
  downloadReceiptHTML: (data: ReceiptData): void => {
    const html = receiptService.generateReceiptHTML(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fatura-${data.order.order_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  },
};