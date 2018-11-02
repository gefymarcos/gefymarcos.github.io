---
layout: post
title: "Web app to PWA!"
date: 2018-10-31 18:21:42 -0300
categories: blog
---

## O que é PWA?

PWA não é um novo framework javascript ou uma tecnologia nova, basicamente ele pode ser definido como:

> Progressive Web Apps são experiências que combinam o melhor da Web e o melhor dos aplicativos.

Mas para que sua aplicação web tradicionais ganhe os "super-poderes" necessários para se tornar uma PWA ela precisa reunir os seguintes atributos:

* **Progressivo**: Deve funcionar em qualquer navegador.
* **Responsivo**: Desktop, celular, tablet...
* **Independente de conectividade**: ~_service workers_~ para funcionar _off-line_ ou com redes de baixa qualidade.
* **Semelhante a aplicativos**: Não tem barra de url e possui interações e navegação no estilo de aplicativos, pois é compilado no modelo de _shell_ de aplicativo.
* **Atual**: Sempre atualizado devido ao _service worker_.
* **Seguro**: Fornecido via HTTPS.
* **Descobrível**: Pode ser identificado como "aplicativo" graças ao manifesto W3C e ao escopo de registro do _service worker_, que permitem que os mecanismos de pesquisa os encontrem.
* **Reenvolvente**: Facilita o reengajamento com recursos como _push notification_.
* **Instalável**: Permite que os usuários "guardem" os aplicativos mais úteis em suas iniciais sem precisar acessar uma loja de aplicativos.
* **Linkável**: Compartilhe facilmente por URL, não requer instalação complexa.

_Tais é louco, tudo isso? Já cansei antes de começar._ Mas fique tranquilo, vou te mostrar como ele parece bem mais complexo do que realmente é.

## Checklist

A google fornece uma [checklist](https://developers.google.com/web/progressive-web-apps/checklist) para te guiar nesse caminho e também o excelente [lighthouse](https://developers.google.com/web/tools/lighthouse/), que serve para, entre outras coisas, auditar nossa app e gerar métricas mostrando quais principios já cobrimos.

### 1 - HTTPS, sempre HTTPS

HTTPS é uma implementação do protrocolo HTTP que utiliza o protocolo SSL/TLS. Dessa forma é possível trafegar dados de forma criptografada e segura, através de certificados digitais no browser.

#### O que fazer?

* Habilitar o SSL no seu domínio, isso é **obrigatório**.
* Redirecionar o status 301 também para HTTPS.

#### Como fazer?

* Eu utilizo Github Pages, nele já é habilitado por padrão, mas você usar também alguns serviços, uma boa opção é o [Let's Encrypt - Free SSL/TLS Certificates](https://letsencrypt.org/)

### 2 - Site responsivo e rápido

Responsividade já é fundamental há algum tempo e também é um dos pricipios base para as PWAs.

#### O que fazer?

* Sempre definir corretamente a viewport no browser.
* Utilizar ```@MediaQuery``` para realizar as adaptações necessárias as diferentes resoluções.
* Sempre se preocupar com performance.

#### Como fazer?

* Definindo a viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

* Utilizar ```@MediaQuery``` e criar os _breakpoints_ de acordo com a **sua** necessidade, não se prenda aos breakpoints pré-definidos por frameworks.

```css
@media only screen and (min-width: 600px)
```

* Execute o lighthouse e verifique onde a _performance_ da sua aplicação pode melhorar.

### 3 - Cor de tema no site

É a definição da sua cor principal de tema, serve pra definir a cor da barra de status.

#### O que fazer?

* Escolher uma cor e buscar o código _hexadecimal_.

#### Como fazer?

* Basta adicionar a seguinte meta tag:

```html
  <meta name="theme-color" content="#FAFAFA">
```

### 4 - Manifesto

É ele o responsável por permitir a "instalação" do seu site, nele devem ser adicionadas informações básicas da sua app.

#### O que fazer?

* Podemos utilizar um gerador de manifesto como esses ou criar o nosso próprio, algumas sugestões de gerenciadores:
  * [App Manifesto](https://app-manifest.firebaseapp.com/)
  * [PWA Builder](https://preview.pwabuilder.com/)


* Nesse arquivo nós vamos definir o ícone que vai ser usado após a instalação e também uma _splash screen_ após a abertura do app.

#### Como fazer?

* Um exemplo de ```manifest.json```:

  ```json
  {
    "name": "Gefy Marcos",
    "short_name": "Gefy",
    "theme_color": "#333333",
    "background_color": "#000000",
    "display": "standalone",
    "scope": "/",
    "start_url": "/index.html",
    "lang": "pt-BR",
    "orientation": "portrait",
    "icons": [
      {
        "src": "/assets/img/icons/logo-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }
  ```

* Algumas regras importantes:
  * o **short_name** não pode ter mais que 12 letras, este é o nome que vai para a tela inicial após instalado.
  * O **background color** é obrigatório.
  * O array **icons** precisa ter pelo menos um ícone com tamanho 512x512.
  * O icone precisa ser **PNG**.
* Após criar o ```manifest.json``` é só adiciona-lo no nosso **head**.

```html
<link rel="manifest" href="/manifest.json">
```

### 5 - Service Worker

Agora é que fica interessante! Service worker é um script executado em segundo plano pelo navegador, ele é executado separado da página web, dessa forma ele possibilita a utilização de recursos que não precisam de uma página ou mesmo interação do usuário.

Através de service workers já é possível utilizar algumas funcionalidades que só eram possíveis em aplicativos, como _push notifications_ e sincronização em segundo plano.

Nesse tutorial vamos nos ater a uma funcionalidade do service worker, a capacidade de interceptar e tratar solicitações de rede, respondendo com um cache caso exista.

##### Importante
* O service worker funciona numa thread separada do browser, ele **NÃO** tem acesso ao DOM.
* Ele sempre deve ter o mesmo nome e ficar no mesmo local para não gerar duplicação.
* O service worker não pode cachear, nesse caso ele pode gerar um cache infinito na máquina do usuário. O certo é você definir no seu servidor o _max-age_ e colocar pra sempre carregar de novo, **sem cache**.
* Lembre-se sempre de deletar o cache antigo quando o site for atualizado.
* [Aqui nós podemos verificar quais navegadores já permitem o uso de quais funcionalidades.](https://jakearchibald.github.io/isserviceworkerready/)

#### Como fazer?

* Vamos a um passo a passo de como criar um _service worker_, iniciamos registrando o nosso service worker, para isso precisamos adicionar o seguinte código no nosso **head**, tem que ser lá pra que ele seja carregado antes de tudo.

  ```js
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.info('registered sw', reg))
      .catch(err => console.error('error registering sw', err));
  }
  ```

O ciclo de vida do service worker possui as seguintes etapas:

* install
* activate
* fetch
* message
* sync
* push

Para que nosso site funcione off-line só precisamos dos 3 primeiros, então vamos criar nosso arquivo ```sw.js```.

##### Install

O evento install é ativado só uma vez, ao registrar a versão do ```sw.js```. se o ```sw.js``` for alterado ele é chamado novamente, esse evento é o local onde vamos armazenar em cache os ativos da página.

```js
var CACHE_NAME = 'gefy-cache-v1';

self.addEventListener('install', event => {
  this.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/img/',
          '/countdown/',
          '/countdown/style.css',
          '/css/main.css',
          '/countdown/beep.mp3',
          '/countdown/finish-beep.mp3'
        ]);
      })
  );
});

```

##### Importante

A função ```addAll``` é tudo ou nada, caso um dos arquivos não seja encontrado toda a operação falha.

##### Activate

O evento ```activate``` também é ativado apenas uma vez, quando uma nova versão do ```sw.js``` for instalada e não possuir nenhuma versão anterior rodando em outra aba. Então você irá utilizado basicamente para deletar coisas antigas de versões anteriores.

```js
this.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => (cacheName.startsWith('gefy-')))
          .filter(cacheName => (cacheName !== CACHE_NAME))
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});
```

Nesse código verificamos se o nosso ```cacheName``` inicia com o nosso prefixo ```gefy-``` ou ainda se nosso ```cacheName``` é diferente do nosso atual cache, caso seja diferente nós deletamos os arquivos antigos, isso é **fundamental** para não mostrar informações desatualizadas para o usuário.

##### Fetch

Um recurso poderoso dos service workers é a capacidade de interceptar as solicitações que a página faz e decidir o que fazer com tal solicitação, esse monitoramento é feito com o evento ```fetch```, ele é ativado toda vez que uma página é requisitada.

```js
// Serve from Cache
this.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => {
        return caches.match('/offline/index.html');
      })
  )
});
```
O ```fetch``` é o responsável por verificar se o arquivo solicitado existe no cache, se existir ele é retornado. Caso a página solicitada não exista você pode redirecionar para uma página off-line.

## Conclusão

É isso! agora temos nosso site funcionando off-line e também salvando algumas páginas em cache, além disso temos um PWA rodando!

## Mas então as PWAs vão matar os Aplicativos?

Minha opnião é que sim! mas apenas aqueles apps que nem deveriam ser apps. Explico, apps que são muitas vezes instaladas e desinstaladas ou apps de baixa complexidade poderão perfeitamente serem PWAs.

Segundo levantamento realizado pelo Adjust, a maioria dos apps são desinstalados depois de **5,8 dias**, na mesma pesquisa também foi observado que **40%** dos usuários **reinstalam** os aplicativos depois de um tempo e os apps que duram mais tempo antes da "morte" são e-commerce com **11 dias** e viagens com **10 dias**, pra finalizar, a Adjust ainda cita que uma das maiores motivações para essa rotatividade é a **falta de espaço** nos smartphones.

É nesse ponto que os PWAs despontam, uma alterativa mais leve, mais fácil de usar e muitas vezes mais rápida, então sim, alguns apps vão morrer.