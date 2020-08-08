// Custom Http Module
function customHttp() {
    return {
        get(url, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                xhr.send();
            } catch (error) {
                cb(error);
            }
        },
        post: function (url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });
                }

                xhr.send(JSON.stringify(body));
            } catch (error) {
                cb(error);
            }
        },
    };
}
// Init http module
const http = customHttp();

const newsService = (function() {
    const apiKey = '06a2aa8fe5544886b845befce7033737';
    const apiUrl = 'https://newsapi.org/v2';

    return {
        topHeadlines(country = 'ua', category = 'technology', cb) {
            http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb);
        },
        everything(query, cb) {
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
        }
    }
})();

//  Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const categorySelect = form.elements['category'];
const searchInput = form.elements['search'];

form.addEventListener('submit', (e) => {
    e.preventDefault();
    loadNews();
});

//  init selects
document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit();
    loadNews();
});


//  Load news function
function loadNews() {
    showLoader();

    const country = countrySelect.value;
    const category = categorySelect.value;
    const searchText = searchInput.value;

    if (!searchText) {
        newsService.topHeadlines(country, category, onGetResponse);
    } else {
        newsService.everything(searchText, onGetResponse);
    }
}

// function on get response from server
function onGetResponse(err, res) {
    hideLoader();

    if (err) {
        showAlert(err, 'error-msg');
        return;
    }

    if (!res.articles.length) {
        const txt ='No news was found for this request';
        showAlert(txt, 'error-msg');
        return;
    }

    renderNews(res.articles);
    // console.log(res.articles);
}

//  function render news
function renderNews(news) {
    const newsContainer = document.querySelector('.news-container .row');
    // check if the news was, it will be cleared (проверка если новости были, то они будут очищены)
    if (newsContainer.children.length) {
        clearContainer(newsContainer);
    }
    let fragment = '';

    news.forEach(newsItem => {
        const el = newsTemplate(newsItem);
        fragment += el;
    });
    newsContainer.insertAdjacentHTML('afterbegin', fragment);    // етот метод позволяет вставить не дом ел., а именно HTML строку
}

//  function News item template function
function newsTemplate(news) {
    const { urlToImage, title, url, description } = news;
    return `
        <div class="col s12">
            <div class="card">
                <div class="card-image">
                    <img src="${urlToImage}" alt="img">
                    <span class="card-title">${title || ''}</span>
                </div>
                <div class="card-content">
                    <p>${description || ''}</p>
                </div>
                <div class="card-action">
                    <a href="${url}">Read more</a>
                </div>
            </div>
        </div>
    `;
}

// function Toasts from Material UI ( Show Alert)
function showAlert(msg, type = 'success') {
    M.toast({ html: msg, classes: type });
}

// function clear container
function clearContainer(container) {
    // 1 - method
    // container.innerHTML = '';
    // 2 - method
    let child = container.lastElementChild;
    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

//  Show loader function
function showLoader() {
    document.body.insertAdjacentHTML(
        'afterbegin',
        `
               <div class="progress">
                 <div class="indeterminate"></div>
               </div>
        `);
}

// Remove loader function (Hide Loader)
function hideLoader() {
    const loader = document.querySelector('.progress');

    if (loader) {
        loader.remove();
    }
}