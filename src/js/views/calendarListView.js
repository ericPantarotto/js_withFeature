/* TODO: 
1. DONE: Saas / HTML previewViewCalendar rename all calendar section in rec  - 
2. DONE: center button and resizing button to add to calendar
3. DONE: calendar view, add detection of user's recipe and current selected recipe!
4. DONE: do not allow for adding a recipe if already one on a given date
5. DONE: localstorage for persisting data
*/

import View from './View.js';
import previewViewCalendar from './previewViewCalendar.js';

class calendarListView extends View {
  _parentElement = document.querySelector('#calendar__list');
  _errorMessage = 'Find a nice recipe to add to the calendar :)';
  _message = '';

  // HACK: to avoid a re-render of th page, compared to below commented block
  _generateHTML() {
    // console.log(this._data);
    return this._data
      .map(cal => previewViewCalendar.render(cal, false))
      .join('');
  }

  // _generateHTML() {
  //   console.log(this._data);
  //   return `${this._data
  //     .sort((a, b) => b.date - a.date)
  //     .map(cal => this.render(cal, false))
  //     .join(' ')}`;
  // }

  // _generateCalendarHTML(cal) {
  //   return `<li class="preview">
  //                   <a
  //                     class="preview__link preview__link--active"
  //                     href="${cal.id}"
  //                   >
  //                     <figure class="preview__fig">
  //                       <img src="${cal.image_url}" alt="${cal.title}" />
  //                     </figure>
  //                     <div class="preview__data">
  //                       <h4 class="preview__title">${cal.title}</h4>
  //                       <p class="preview__publisher">${cal.date.toLocaleDateString()}</p>
  //                     </div>
  //                     <div class="preview__user-generated">
  //                       <svg>
  //                         <use href="${icons}#icon-user"></use>
  //                       </svg>
  //                     </div>
  //                     <button
  //                       class="btn--tiny btn--decrease-servings"
  //                       data-calendarid="${cal.id}"
  //                       title="Remove this item from calendar"
  //                     >
  //                       <svg>
  //                         <use href="${icons}#icon-minus-circle"></use>
  //                       </svg>
  //                     </button>
  //                   </a>
  //                 </li>`;
  // }

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  addHandlerRemoveCalendar(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const removeCalendarBtn = e.target.closest('.btn--decrease-servings');
      if (!removeCalendarBtn) return;

      const calendarId = removeCalendarBtn.dataset.calendarid;
      removeCalendarBtn.closest('.preview').remove();
      handler(calendarId);
      // HACK: after delete you don't want the <a> element to redirect to the deleted recipe, but then you want the normal behavior to be preserved
      e.preventDefault();
      e.defaultPrevented; // return true;
    });
  }
}

export default new calendarListView();
