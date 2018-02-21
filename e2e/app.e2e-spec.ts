import { NewuiPage } from './app.po';

describe('newui App', () => {
  let page: NewuiPage;

  beforeEach(() => {
    page = new NewuiPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
