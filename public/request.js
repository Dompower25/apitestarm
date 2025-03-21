class Request {
    constructor(requestData = {}, config) {
        // Инициализация конфигурации
        this._config = config;

        // Параметры по умолчанию
        this.default = {
            version: null,
            method: 'GET',
            url: null,
            content: null,
            params: {},
            headers: {},
            json: false,
            returnTransfer: true,
        };

        // Объединяем данные по умолчанию с переданными
        const data = { ...this.default, ...requestData };

        this.httpVersion = data.version;
        this.url = this._config.genUrl(data.url);
        this.content = data.content;
        this.method = data.method;
        this.params = data.params;
        this.headers = data.headers;
        this.json = data.json;

        // Добавляем заголовок Content-Type, если это JSON
        if (this.json) {
            this.headers['Content-Type'] = 'application/json';
        }
        this.headers['User -Agent'] = `ArmtekRestClient ver ${this._config.getVersion()}`;
    }

    async send() {
        // Формируем параметры запроса
        const options = {
            method: this.method,
            headers: this.headers,
        };

        // Обработка тела запроса для POST, PUT, PATCH
        if (['POST', 'PUT', 'PATCH'].includes(this.method)) {
            if (Object.keys(this.params).length > 0) {
                options.body = this.json ? JSON.stringify(this.params) : new URLSearchParams(this.params).toString();
            } else if (this.content) {
                options.body = this.json ? JSON.stringify(this.content) : this.content;
            }
        } else if (Object.keys(this.params).length > 0) {
            this.url += '?' + new URLSearchParams(this.params).toString();
        }

        // Отправка запроса и получение ответа
        const response = await fetch(this.url, options);
        return await this.handleResponse(response);
    }

    async handleResponse(response) {
        // Проверка статуса ответа
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Возвращаем ответ в формате JSON или текст
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    }

    static method(method) {
        return method.toUpperCase();
    }

    getCurlHttpVersion() {
        const version = this.httpVersion;
        if (version === 1.0) return 'HTTP/1.0';
        if (version === 1.1) return 'HTTP/1.1';
        return null;
    }
}

// Пример конфигурационного класса
class Config {
    genUrl(url) {
        // Генерация полного URL
        return `https://api.example.com/${url}`;
    }

    getUser: Login() {
        return 'user';
    }

    getUser: Password() {
        return 'password';
    }

    getVersion() {
        return '1.0.0';
    }
}

// Пример использования
const config = new Config();
const request = new Request({
    method: 'POST',
    url: 'endpoint',
    params: { key: 'value' },
    json: true
}, config);

request.send()
    .then(response => console.log(response))
    .catch(error => console.error(error));