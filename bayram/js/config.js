/**
 * Buraya kendi bilgilerini yaz. Tek değiştirmen gereken dosya.
 */
export const config = {
  // Kendi IBAN'ını yaz (boşluk olabilir, kopyalanırken otomatik temizlenir)
  iban: 'TR00 0000 0000 0000 0000 0000 00',

  // IBAN sahibinin görünen ismi (QR taranınca veya bazı bankalar gösterir)
  ibanHolder: 'Ad Soyad',

  // Banka adı (opsiyonel, kart üzerinde küçük etiket için)
  bankName: '',

  // Sosyal paylaşımda kullanılacak site URL'i (boş bırakırsan window.location kullanılır)
  shareUrl: 'https://ahmethakanaydin.dev/bayram/',
};
