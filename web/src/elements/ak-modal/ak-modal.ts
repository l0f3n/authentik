import { SlottedTemplateResult } from "../types.js";

import { PFSize } from "#common/enums";

import { AKElement } from "#elements/Base";

import { adoptStyles as adoptStyleSheetsShim, css, CSSResult, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import PFBackdrop from "@patternfly/patternfly/components/Backdrop/backdrop.css";
import PFButton from "@patternfly/patternfly/components/Button/button.css";
import PFCard from "@patternfly/patternfly/components/Card/card.css";
import PFContent from "@patternfly/patternfly/components/Content/content.css";
import PFForm from "@patternfly/patternfly/components/Form/form.css";
import PFFormControl from "@patternfly/patternfly/components/FormControl/form-control.css";
import PFModalBox from "@patternfly/patternfly/components/ModalBox/modal-box.css";
import PFPage from "@patternfly/patternfly/components/Page/page.css";
import PFTitle from "@patternfly/patternfly/components/Title/title.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

@customElement("ak-modal")
export class AKModal extends AKElement {
    static id?: string;

    get modalID(): string | null {
        return (this.constructor as typeof AKModal).id ?? null;
    }

    //#region Styles

    public static DialogStyles: CSSResult[] = [
        PFModalBox,

        css`
            .pf-c-modal-box {
                place-self: center;
                border: none;
                box-shadow: var(--pf-global--BoxShadow--xl);
                width: var(--pf-c-modal-box--m-lg--lg--MaxWidth);

                max-width: var(--pf-c-modal-box--MaxWidth);
                max-height: var(--pf-c-modal-box--MaxHeight);

                &::backdrop {
                    background-color: var(--pf-global--BackgroundColor--dark-transparent-100);
                }

                &.pf-m-xl {
                    --pf-c-modal-box--Width: calc(1.5 * var(--pf-c-modal-box--m-lg--lg--MaxWidth));
                }
            }

            :host([theme="dark"]) {
                .pf-c-modal-box {
                    --pf-c-modal-box--BackgroundColor: var(--ak-dark-background);
                }
            }
        `,
    ];

    public static styles: CSSResult[] = [
        PFBase,
        PFButton,
        PFModalBox,
        PFForm,
        PFTitle,
        PFFormControl,
        PFBackdrop,
        PFPage,
        PFCard,
        PFContent,
    ];

    //#endregion

    //#region Properties

    protected closedBy: "any" | "none" | "closerequest" = "any";

    @property()
    public size: PFSize = PFSize.Large;

    @property({ type: Boolean })
    public get open(): boolean {
        return this.dialog.open;
    }

    public set open(value: boolean) {
        if (value && this.dialog.parentElement) {
            this.dialog.showModal();
        } else {
            this.dialog.close();
        }
    }

    //#endregion

    //#region Public methods

    /**
     * Close the modal.
     */
    public close = (returnValue?: string) => {
        this.dialog.close(returnValue);
    };

    /**
     * Show the modal.
     */
    public show = (): void => {
        this.open = true;
    };

    //#endregion

    //#region Listeners

    #backdropListener = (event: MouseEvent) => {
        if (!this.open || event.target !== event.currentTarget) return;

        this.open = false;
    };

    //#endregion

    //#region Lifecycle

    protected readonly dialog: HTMLDialogElement;
    protected readonly modalContent: HTMLElement;
    protected readonly dialogShadowRoot: ShadowRoot;

    #observer: MutationObserver | null = null;

    constructor() {
        super();

        const dialog = document.createElement("dialog");

        dialog.classList.add("pf-c-modal-box");
        dialog.setAttribute("aria-labelledby", "modal-title");
        dialog.setAttribute("aria-describedby", "modal-description");

        dialog.addEventListener("mousedown", this.#backdropListener);

        if (this.modalID) {
            dialog.id = this.modalID;
        }

        this.dialog = dialog;

        this.modalContent = document.createElement("div");
        this.dialogShadowRoot = this.modalContent.attachShadow({ mode: "open" });

        dialog.appendChild(this.modalContent);
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        const { elementStyles } = this.constructor as typeof AKModal;
        adoptStyleSheetsShim(this.dialogShadowRoot, elementStyles);

        return this.dialogShadowRoot;
    }

    public connectedCallback(): void {
        super.connectedCallback();
        this.appendChild(this.dialog);
    }

    //#region Render

    /**
     * @abstract
     */
    protected renderModalInner(): SlottedTemplateResult {
        return html`<slot></slot>`;
    }

    protected override firstUpdated(): void {
        this.#observer = new MutationObserver(() => {
            this.requestUpdate();
        });

        this.#observer.observe(this.dialog, {
            attributes: true,
            attributeFilter: ["open"],
        });

        const open = this.getAttribute("open") !== null;

        if (open) {
            this.show();
        }
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback();
        this.#observer?.disconnect();
        this.#observer = null;
    }

    render(): SlottedTemplateResult {
        return this.open ? this.renderModalInner() : nothing;
    }

    //#endregion
}
declare global {
    interface HTMLElementTagNameMap {
        "ak-modal": AKModal;
    }
}
