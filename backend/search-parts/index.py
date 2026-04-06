import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Поиск запчастей по артикулу в базе данных."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    params = event.get('queryStringParameters') or {}
    article = (params.get('article') or '').strip()

    if not article:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Введите артикул для поиска'}, ensure_ascii=False)
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute(
        "SELECT article, name, price, in_stock, brand FROM parts WHERE article ILIKE %s ORDER BY article LIMIT 20",
        (f'%{article}%',)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    results = [
        {
            'article': r[0],
            'name': r[1],
            'price': float(r[2]),
            'in_stock': r[3],
            'brand': r[4]
        }
        for r in rows
    ]

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'results': results, 'count': len(results)}, ensure_ascii=False)
    }
