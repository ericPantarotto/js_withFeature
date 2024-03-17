import icons from 'url:../../img/icons.svg';
import View from './View.js';

class PreviewViewCalender extends View {
  _parentElement = '';

  _generateHTML() {
    // console.log(this._data);
    const id = window.location.hash.slice(1);

    return `<li class="preview">
                    <a
                      class="preview__link ${
                        id === this._data.id ? 'preview__link--active' : ''
                      }"
                      href="#${this._data.id}"
                    >
                      <figure class="preview__fig">
                        <img src="${this._data.image_url}" alt="${
      this._data.title
    }" />
                      </figure>
                      <div class="preview__data">
                        <h4 class="preview__title">${this._data.title}</h4>
                        <p class="preview__publisher">${new Date(
                          this._data.date
                        ).toLocaleDateString()}</p>
                      </div>
                      <div class="preview__user-generated ${
                        this._data.key ? '' : 'hidden'
                      }">
                        <svg>
                          <use href="${icons}#icon-user"></use>
                        </svg>
                      </div>
                      <button
                        class="btn--tiny btn--decrease-servings"
                        data-calendarid="${this._data.id}"
                        title="Remove this item from calendar"
                      >
                        <svg>
                          <use href="${icons}#icon-minus-circle"></use>
                        </svg>
                      </button>
                    </a>
                  </li>`;
  }
}

export default new PreviewViewCalender();
