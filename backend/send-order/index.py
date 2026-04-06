import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
}

TO_EMAIL = 'zakaz@avtozapnn.ru'
FROM_EMAIL = 'zakaz@avtozapnn.ru'


def handler(event: dict, context) -> dict:
    """Отправка заказа на почту zakaz@avtozapnn.ru."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    client = body.get('client', {})
    items = body.get('items', [])
    total = body.get('total', 0)

    name = client.get('name', '—')
    phone = client.get('phone', '—')
    email = client.get('email', '—')
    address = client.get('address', '—')
    comment = client.get('comment', '—')

    items_rows = ''.join(
        f"<tr><td style='padding:6px 10px;border-bottom:1px solid #eee'>{i['name']}</td>"
        f"<td style='padding:6px 10px;border-bottom:1px solid #eee;text-align:center'>{i['qty']}</td>"
        f"<td style='padding:6px 10px;border-bottom:1px solid #eee;text-align:right'>{i['price']:,} ₽</td></tr>"
        for i in items
    )

    html = f"""
    <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>
      <h2 style='background:#cc2200;color:#fff;padding:16px 20px;margin:0'>Новый заказ с сайта</h2>
      <div style='padding:20px;background:#f9f9f9'>
        <h3 style='margin-top:0'>Данные клиента</h3>
        <table style='width:100%'>
          <tr><td style='color:#888;padding:4px 0;width:120px'>Имя:</td><td><b>{name}</b></td></tr>
          <tr><td style='color:#888;padding:4px 0'>Телефон:</td><td><b>{phone}</b></td></tr>
          <tr><td style='color:#888;padding:4px 0'>Email:</td><td>{email}</td></tr>
          <tr><td style='color:#888;padding:4px 0'>Адрес:</td><td>{address}</td></tr>
          <tr><td style='color:#888;padding:4px 0'>Комментарий:</td><td>{comment}</td></tr>
        </table>
      </div>
      <div style='padding:20px'>
        <h3 style='margin-top:0'>Состав заказа</h3>
        <table style='width:100%;border-collapse:collapse'>
          <thead>
            <tr style='background:#f0f0f0'>
              <th style='padding:8px 10px;text-align:left'>Наименование</th>
              <th style='padding:8px 10px;text-align:center'>Кол-во</th>
              <th style='padding:8px 10px;text-align:right'>Сумма</th>
            </tr>
          </thead>
          <tbody>{items_rows}</tbody>
        </table>
        <div style='text-align:right;padding:12px 10px;font-size:18px;font-weight:bold'>
          Итого: {total:,} ₽
        </div>
      </div>
    </div>
    """

    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Новый заказ от {name} на сумму {total:,} ₽'
    msg['From'] = FROM_EMAIL
    msg['To'] = TO_EMAIL
    msg.attach(MIMEText(html, 'html', 'utf-8'))

    smtp_password = os.environ.get('SMTP_PASSWORD', '')
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.mail.ru')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))

    with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
        server.login(FROM_EMAIL, smtp_password)
        server.sendmail(FROM_EMAIL, TO_EMAIL, msg.as_string())

    return {
        'statusCode': 200,
        'headers': CORS_HEADERS,
        'body': json.dumps({'ok': True}),
    }