// components/TermsModal.tsx
import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Shield, FileText, Eye, Lock, Users, Package, Truck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (hasScrolledToBottom && isChecked) {
      onAccept();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-blue-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Termos e Condições</h2>
              <p className="text-xs text-white/80">HSE MarketPlace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div 
          className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6"
          onScroll={handleScroll}
        >
          {/* Versão Resumida */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-black text-blue-800">Resumo dos Termos</h3>
            </div>
            <p className="text-sm text-blue-700 leading-relaxed">
              O HSE MarketPlace é uma plataforma exclusiva para produtos relacionados a <strong>Saúde, Segurança e Ergonomia (HSE)</strong>. 
              Ao se cadastrar, a sua empresa concorda em comercializar apenas produtos dentro destas categorias. 
              O descumprimento resultará em suspensão ou banimento permanente da plataforma.
            </p>
          </div>

          {/* Versão Completa */}
          <div className="space-y-6">
            {/* 1. Introdução */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-900" />
                1. Introdução e Definições
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  O presente Termo de Uso e Política de Privacidade ("Termo") regula a relação entre 
                  o <strong>HSE MarketPlace</strong> ("Plataforma", "Nós", "Nosso") e a sua empresa ("Parceiro", "Vendedor", "Você") 
                  que deseja utilizar os serviços da plataforma para comercialização de produtos.
                </p>
                <p>
                  Ao se cadastrar, você declara ter lido, compreendido e aceitado integralmente todas as cláusulas deste Termo.
                </p>
              </div>
            </div>

            {/* 2. Escopo do Marketplace - HSE */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-900" />
                2. Escopo do Marketplace - Produtos HSE
              </h3>
              <div className="text-sm text-gray-600 space-y-3">
                <p className="font-bold text-blue-800">
                  O HSE MarketPlace é uma plataforma exclusiva para produtos relacionados a:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Saúde (Health)</strong> - Equipamentos médicos, produtos de bem-estar, suplementos, medicamentos (quando permitido por lei), materiais hospitalares, produtos de higiene e cuidados pessoais.</li>
                  <li><strong>Segurança (Safety)</strong> - Equipamentos de Proteção Individual (EPI's), sistemas de segurança, extintores, alarmes, câmaras de vigilância, coletes, capacetes, luvas, óculos de protecção, sinalização.</li>
                  <li><strong>Ergonomia (Ergonomics)</strong> - Mobiliário ergonómico (cadeiras, mesas reguláveis), suportes para computadores, teclados ergonómicos, iluminação adequada, acessórios para postura correcta.</li>
                </ul>
                <div className="bg-yellow-50 p-3 rounded-lg mt-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Importante:</strong> Qualquer tentativa de comercializar produtos fora destas categorias será considerada violação grave deste Termo.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Proibição de Produtos Não HSE */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                3. Proibição de Produtos Não Relacionados ao HSE
              </h3>
              <div className="text-sm text-gray-600 space-y-3">
                <p>
                  É expressamente <span className="font-bold text-red-600">PROIBIDO</span> o cadastro e comercialização de produtos que não estejam directamente relacionados à Saúde, Segurança e Ergonomia (HSE).
                </p>
                <p>Exemplos de produtos <span className="font-bold text-red-600">NÃO PERMITIDOS</span>:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Moda e vestuário em geral (excepto EPI's e roupas hospitalares)</li>
                  <li>Calçados comuns (excepto sapatos de segurança)</li>
                  <li>Electrónicos de consumo (TVs, smartphones, tablets - excepto equipamentos médicos)</li>
                  <li>Alimentos e bebidas (excepto suplementos alimentares)</li>
                  <li>Bolsas e acessórios de moda</li>
                  <li>Produtos de beleza estéticos (excepto cosméticos médicos)</li>
                  <li>Brinquedos e artigos infantis (excepto equipamentos de segurança infantil)</li>
                  <li>Móveis convencionais (excepto móveis ergonómicos)</li>
                </ul>
              </div>
            </div>

            {/* 4. Consequências do Descumprimento */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                4. Consequências do Descumprimento
              </h3>
              <div className="text-sm text-gray-600 space-y-3">
                <p>
                  A violação deste Termo, incluindo a tentativa de comercializar produtos não relacionados ao HSE, resultará em:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li><strong>1ª Violação - Aviso Formal:</strong> Notificação por email com prazo de 48h para remoção dos produtos irregulares.</li>
                  <li><strong>2ª Violação - Suspensão Temporária:</strong> Acesso à plataforma bloqueado por 30 dias, sem possibilidade de novas vendas.</li>
                  <li><strong>3ª Violação - Banimento Permanente:</strong> Remoção definitiva da conta, bloqueio de CPF/CNPJ e comunicação às autoridades competentes.</li>
                </ol>
                <div className="bg-red-50 p-3 rounded-lg mt-3 border border-red-200">
                  <p className="text-sm text-red-800 font-bold">
                    ⚠️ Atenção: O banimento é definitivo e irreversível. A empresa banida não poderá recadastrar-se sob nenhuma forma.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Política de Privacidade */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-900" />
                5. Política de Privacidade e Protecção de Dados
              </h3>
              <div className="text-sm text-gray-600 space-y-3">
                <p>
                  O HSE MarketPlace valoriza a privacidade e segurança dos dados de seus parceiros e clientes.
                  Ao se cadastrar, você autoriza a coleta e tratamento dos seguintes dados:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Dados cadastrais da empresa (razão social, NIF, endereço, telefone, email)</li>
                  <li>Dados dos representantes legais e contactos</li>
                  <li>Dados de produtos comercializados</li>
                  <li>Dados de transacções financeiras</li>
                  <li>Dados de acesso à plataforma (logs, IP, navegador)</li>
                </ul>
                <p>
                  Os seus dados serão utilizados exclusivamente para:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Gerenciar a sua conta na plataforma</li>
                  <li>Processar pedidos e pagamentos</li>
                  <li>Enviar notificações sobre a sua conta e pedidos</li>
                  <li>Melhorar os nossos serviços e experiência do utilizador</li>
                  <li>Cumprir obrigações legais e fiscais</li>
                </ul>
                <div className="bg-blue-50 p-3 rounded-lg mt-3">
                  <p className="text-sm text-blue-800">
                    🔒 Os seus dados são armazenados com segurança e não serão partilhados com terceiros sem o seu consentimento,
                    excepto quando necessário para processamento de pagamentos ou por exigência legal.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Direitos e Deveres do Vendedor */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-900" />
                6. Direitos e Deveres do Vendedor
              </h3>
              <div className="text-sm text-gray-600 space-y-3">
                <p className="font-bold">Deveres do Vendedor:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Fornecer informações verdadeiras e actualizadas sobre a sua empresa e produtos</li>
                  <li>Garantir que todos os produtos comercializados são genuínos e de qualidade</li>
                  <li>Cumprir os prazos de entrega estabelecidos</li>
                  <li>Oferecer suporte adequado aos clientes</li>
                  <li>Manter stock actualizado na plataforma</li>
                  <li>Respeitar a política de preços e promoções da plataforma</li>
                </ul>
                <p className="font-bold mt-3">Direitos do Vendedor:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Aceder a relatórios de vendas e desempenho</li>
                  <li>Receber pagamentos conforme política estabelecida</li>
                  <li>Solicitar suporte da plataforma</li>
                  <li>Participar de programas promocionais</li>
                  <li>Encerrar a sua conta a qualquer momento</li>
                </ul>
              </div>
            </div>

            {/* 7. Responsabilidades da Plataforma */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-900" />
                7. Responsabilidades da Plataforma
              </h3>
              <div className="text-sm text-gray-600 space-y-3">
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Fornecer infra-estrutura tecnológica para a operação do marketplace</li>
                  <li>Processar pagamentos de forma segura</li>
                  <li>Oferecer suporte técnico aos vendedores</li>
                  <li>Promover a plataforma e atrair clientes</li>
                  <li>Mediar conflitos entre vendedores e compradores quando necessário</li>
                  <li>Garantir a segurança dos dados conforme legislação aplicável</li>
                </ul>
              </div>
            </div>

            {/* 8. Política de Pagamentos e Comissões */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-900" />
                8. Política de Pagamentos e Comissões
              </h3>
              <div className="text-sm text-gray-600 space-y-3">
                <p>
                  As transacções financeiras realizadas na plataforma estão sujeitas às seguintes condições:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Os pagamentos são processados em até 5 dias úteis após a confirmação da entrega</li>
                  <li>A plataforma cobra uma comissão de 8% sobre o valor de cada venda realizada</li>
                  <li>Taxas adicionais podem ser aplicadas para métodos de pagamento específicos</li>
                  <li>Estornos e reembolsos seguem a política de devolução da plataforma</li>
                </ul>
              </div>
            </div>

            {/* 9. Vigência e Rescisão */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-900" />
                9. Vigência e Rescisão do Contrato
              </h3>
              <div className="text-sm text-gray-600 space-y-3">
                <p>
                  Este Termo entra em vigor na data do aceite e permanece válido enquanto a sua empresa estiver cadastrada na plataforma.
                </p>
                <p>
                  O contrato pode ser rescindido por qualquer das partes mediante comunicação por escrito, com antecedência mínima de 30 dias.
                </p>
                <p>
                  A plataforma reserva-se o direito de rescindir imediatamente este contrato em caso de violação grave dos termos aqui estabelecidos.
                </p>
              </div>
            </div>

            {/* 10. Disposições Gerais */}
            <div className="pb-4">
              <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-900" />
                10. Disposições Gerais
              </h3>
              <div className="text-sm text-gray-600 space-y-3">
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Este Termo constitui o acordo integral entre as partes</li>
                  <li>Alterações neste Termo serão comunicadas com antecedência mínima de 15 dias</li>
                  <li>O não exercício de qualquer direito não constitui renúncia</li>
                  <li>Este Termo é regido pelas leis da República de Angola</li>
                  <li>Foro eleito é o da Comarca de Luanda, com renúncia a qualquer outro, por mais privilegiado que seja</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Indicador de Leitura */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasScrolledToBottom ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
                <span className="text-sm font-medium text-gray-600">
                  {hasScrolledToBottom ? "Termo lido até ao final" : "Leia o termo até ao final para continuar"}
                </span>
              </div>
              <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-900 transition-all duration-300"
                  style={{ width: hasScrolledToBottom ? '100%' : '0%' }}
                />
              </div>
            </div>
          </div>

          {/* Checkbox de Aceitação */}
          <div className="border-t border-gray-100 pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                disabled={!hasScrolledToBottom}
                className="mt-0.5 w-5 h-5 text-blue-900 rounded border-gray-300 focus:ring-blue-900 disabled:opacity-50"
              />
              <div className="flex-1">
                <span className="text-sm font-bold text-gray-800">
                  Declaro que li, compreendi e aceito integralmente os Termos e Condições do HSE MarketPlace
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Concordo que a minha empresa comercializará exclusivamente produtos relacionados à Saúde, Segurança e Ergonomia (HSE).
                  Estou ciente de que o descumprimento resultará em suspensão ou banimento da plataforma.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
          >
            Recusar
          </button>
          <button
            onClick={handleAccept}
            disabled={!hasScrolledToBottom || !isChecked}
            className="flex-1 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Aceitar Termos
          </button>
        </div>
      </motion.div>
    </div>
  );
}