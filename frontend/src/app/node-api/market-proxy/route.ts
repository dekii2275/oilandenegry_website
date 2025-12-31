// src/app/api/market-proxy/route.ts
import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
  try {
    // Lấy tham số từ URL
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const range = searchParams.get('range');

    // 1. Nếu không có symbol, trả về lỗi
    if (!symbol) {
      return NextResponse.json({ error: 'Missing symbol' }, { status: 400 });
    }

    // 2. Nếu không có range -> Chế độ lấy giá hiện tại (cho Header 4 ô)
    if (!range) {
      const result = await yahooFinance.quote(symbol);
      return NextResponse.json(result);
    }

    // 3. Nếu có range -> Chế độ lấy lịch sử (cho Biểu đồ)
    const endDate = new Date();
    const startDate = new Date();
    
    // ✅ Dùng interval chi tiết hơn với chart() API
    let interval: '1h' | '1d' | '1wk' | '1mo' = '1h';
    let period1: Date;
    let period2: Date;

    // Tính toán ngày bắt đầu và interval dựa trên range
    switch (range) {
      case '1wk': // 1 Tuần
        startDate.setDate(endDate.getDate() - 7);
        interval = '1h'; // ✅ Lấy từng giờ → ~100+ điểm (24h x 7 ngày)
        break;

      case '1mo': // 1 Tháng
        startDate.setMonth(endDate.getMonth() - 1);
        interval = '1d'; // Lấy theo ngày → ~30 điểm
        break;

      case '3mo': // 3 Tháng
        startDate.setMonth(endDate.getMonth() - 3);
        interval = '1d'; // Lấy theo ngày → ~90 điểm
        break;

      case '1y': // 1 Năm
        startDate.setFullYear(endDate.getFullYear() - 1);
        interval = '1wk'; // Lấy theo tuần → ~52 điểm
        break;

      case '5y': // 5 Năm
        startDate.setFullYear(endDate.getFullYear() - 5);
        interval = '1mo'; // Lấy theo tháng → ~60 điểm
        break;

      default:
        startDate.setDate(endDate.getDate() - 7);
        interval = '1h';
    }

    period1 = startDate;
    period2 = endDate;

    console.log('📊 Fetching data:', { 
      symbol, 
      range, 
      interval, 
      period1: period1.toISOString(), 
      period2: period2.toISOString() 
    });

    // ✅ Dùng chart() thay vì historical() - hỗ trợ nhiều interval hơn
    const result = await yahooFinance.chart(symbol, {
      period1,
      period2,
      interval,
    });

    // Kiểm tra nếu không có dữ liệu
    if (!result || !result.quotes || result.quotes.length === 0) {
      return NextResponse.json(
        { error: 'No data available for this symbol' },
        { status: 404 }
      );
    }

    // Map dữ liệu cho gọn nhẹ trước khi trả về Client
    const chartData = result.quotes.map((item) => ({
      date: item.date, // Thời gian
      price: item.close, // Giá đóng cửa
      high: item.high, // Giá cao nhất
      low: item.low, // Giá thấp nhất
      volume: item.volume, // Khối lượng giao dịch
    })).filter(item => item.price !== null); // Lọc bỏ dữ liệu null

    console.log(`✅ Successfully fetched ${chartData.length} data points`);

    return NextResponse.json(chartData);

  } catch (error: any) {
    console.error('❌ Yahoo Finance Error:', error);

    // Xử lý các loại lỗi cụ thể
    if (error.name === 'InvalidOptionsError') {
      return NextResponse.json(
        { error: 'Invalid parameters provided', details: error.message },
        { status: 400 }
      );
    }

    if (error.message?.includes('Not Found')) {
      return NextResponse.json(
        { error: 'Symbol not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch market data',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}