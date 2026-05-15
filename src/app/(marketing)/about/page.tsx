export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="font-display text-4xl font-bold">Về Khởi Doanh AI</h1>
      <div className="prose mt-6 space-y-4 text-muted-foreground">
        <p>
          Khởi Doanh AI là nền tảng SaaS giúp founder Việt Nam thành lập doanh nghiệp và vận hành các nghiệp vụ pháp lý-thuế-bảo hiểm bằng AI.
        </p>
        <p>
          Triết lý của chúng tôi đơn giản: <strong className="text-foreground">founder nên dùng 100% thời gian cho sản phẩm và khách hàng</strong>,
          không phải đi photocopy giấy tờ ở Sở KH&ĐT.
        </p>
        <p>
          Hệ thống cập nhật pháp lý liên tục — mỗi khi luật, nghị định, thông tư mới ban hành, đội ngũ pháp chế của chúng tôi cập nhật template và prompt AI. Khách hàng luôn dùng phiên bản mới nhất, không cần lo việc tài liệu lỗi thời.
        </p>
      </div>
    </div>
  );
}
