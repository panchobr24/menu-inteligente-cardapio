
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, Download } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  restaurantId: string;
  restaurantName: string;
}

const QRCodeGenerator = ({ restaurantId, restaurantName }: QRCodeGeneratorProps) => {
  const [generating, setGenerating] = useState(false);

  const generateAndDownloadQR = async () => {
    setGenerating(true);
    
    try {
      const menuUrl = `${window.location.origin}/menu/${restaurantId}`;
      
      // Generate QR code as data URL
      const qrDataURL = await QRCode.toDataURL(menuUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `qr-code-${restaurantName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = qrDataURL;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("QR Code baixado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error("Erro ao gerar QR Code");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generateAndDownloadQR}
      disabled={generating}
      className="w-full"
      variant="outline"
    >
      <QrCode className="w-4 h-4 mr-2" />
      {generating ? "Gerando..." : "Gerar QR Code"}
      <Download className="w-4 h-4 ml-2" />
    </Button>
  );
};

export default QRCodeGenerator;
