import { customElement, property } from '@polymer/decorators';
import { html, PolymerElement } from '@polymer/polymer';
import '../components/hero/simple-hero';
import '../components/markdown/remote-markdown';
import '../elements/footer-block';
import { speakersInfoPage, heroSettings } from '../utils/data';
import { updateMetadata } from '../utils/metadata';

@customElement('speakers-info-page')
export class SpeakersInfoPage extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <remote-markdown path="[[source]]"></remote-markdown>

      <footer-block></footer-block>
    `;
  }

  private heroSettings = heroSettings.speakersInfo;

  @property({ type: String })
  source = speakersInfoPage;

  override connectedCallback() {
    super.connectedCallback();
    updateMetadata(this.heroSettings.title, this.heroSettings.metaDescription);
  }
}
