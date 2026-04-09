"""Возвращает список товаров из базы данных для каталога."""
import os
import json
import psycopg2


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    schema = os.environ['MAIN_DB_SCHEMA']
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute(f"""
        SELECT id, article, name, price, old_price, in_stock, brand, type, img_url
        FROM {schema}.parts
        ORDER BY name ASC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    products = []
    for row in rows:
        products.append({
            'id': row[0],
            'article': row[1],
            'name': row[2],
            'price': float(row[3]),
            'oldPrice': float(row[4]) if row[4] else None,
            'inStock': row[5],
            'brand': row[6] or '',
            'type': row[7] or '',
            'imgUrl': row[8] or ''
        })

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'products': products}, ensure_ascii=False)
    }
