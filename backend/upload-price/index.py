"""Принимает XLS/XLSX файл в base64, парсит его и обновляет базу данных товаров."""
import os
import json
import base64
import io
import psycopg2
import openpyxl
import xlrd


def parse_xls(file_bytes):
    wb = xlrd.open_workbook(file_contents=file_bytes)
    ws = wb.sheet_by_index(0)
    rows = []
    for i in range(ws.nrows):
        rows.append(tuple(ws.cell_value(i, j) for j in range(ws.ncols)))
    return rows


def parse_xlsx(file_bytes):
    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
    ws = wb.active
    return list(ws.iter_rows(values_only=True))


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    body = json.loads(event.get('body', '{}'))
    password = body.get('password', '')
    file_b64 = body.get('file', '')
    filename = body.get('filename', '').lower()

    if password != os.environ.get('ADMIN_PASSWORD', ''):
        return {
            'statusCode': 403,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный пароль'})
        }

    if not file_b64:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Файл не передан'})
        }

    file_bytes = base64.b64decode(file_b64)

    try:
        if filename.endswith('.xls'):
            rows = parse_xls(file_bytes)
        else:
            try:
                rows = parse_xlsx(file_bytes)
            except Exception:
                rows = parse_xls(file_bytes)
    except Exception as e:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Не удалось прочитать файл: {str(e)}'})
        }
    if not rows:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Файл пустой'})
        }

    # Определяем заголовки из первой строки
    headers = [str(h).strip().lower() if h else '' for h in rows[0]]

    def col(row, names):
        for name in names:
            if name in headers:
                idx = headers.index(name)
                if idx < len(row):
                    return row[idx]
        return None

    schema = os.environ['MAIN_DB_SCHEMA']

    records = []
    skipped = 0

    for row in rows[1:]:
        article = col(row, ['артикул', 'article', 'арт', 'art'])
        name = col(row, ['наименование', 'название', 'name', 'товар'])
        price_raw = col(row, ['цена', 'price', 'стоимость'])
        brand = col(row, ['марка', 'бренд', 'brand', 'производитель'])
        part_type = col(row, ['тип', 'type', 'категория', 'группа'])
        old_price_raw = col(row, ['старая цена', 'old_price', 'oldprice', 'цена до'])
        in_stock_raw = col(row, ['наличие', 'in_stock', 'остаток', 'склад'])

        if not article or not name:
            skipped += 1
            continue

        try:
            price = float(str(price_raw).replace(',', '.').replace('\xa0', '').replace(' ', '')) if price_raw else 0
        except Exception:
            skipped += 1
            continue

        try:
            old_price = float(str(old_price_raw).replace(',', '.').replace('\xa0', '').replace(' ', '')) if old_price_raw else None
        except Exception:
            old_price = None

        if in_stock_raw is None:
            in_stock = True
        elif isinstance(in_stock_raw, bool):
            in_stock = in_stock_raw
        else:
            in_stock_str = str(in_stock_raw).strip().lower()
            in_stock = in_stock_str not in ('0', 'нет', 'no', 'false', 'н', '')

        records.append((
            str(article).strip(),
            str(name).strip(),
            price,
            old_price,
            str(brand).strip() if brand else None,
            str(part_type).strip() if part_type else None,
            in_stock,
        ))

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.executemany(f"""
        INSERT INTO {schema}.parts (article, name, price, old_price, brand, type, in_stock)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (article) DO UPDATE SET
            name = EXCLUDED.name,
            price = EXCLUDED.price,
            old_price = EXCLUDED.old_price,
            brand = EXCLUDED.brand,
            type = EXCLUDED.type,
            in_stock = EXCLUDED.in_stock
    """, records)

    total = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()

    inserted = total
    updated = 0

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'inserted': inserted,
            'updated': updated,
            'skipped': skipped,
            'total': inserted + updated
        }, ensure_ascii=False)
    }