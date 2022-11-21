import { IToolBarItemProps, ISlotElement } from '@univer/base-component';
import { SheetContext, IOCContainer, UniverSheet, Plugin, PLUGIN_NAMES } from '@univer/core';
import { SheetPlugin } from '@univer/base-sheets';
import { SCREENSHOT_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { IConfig } from './IData/IScreenshot';
import { en, zh } from './Locale';
import { ScreenshotButton } from './UI/ScreenshotButton';

export interface IScreenshotPluginConfig {}

export class ScreenshotPlugin extends Plugin {
    constructor(config?: IScreenshotPluginConfig) {
        super(SCREENSHOT_PLUGIN_NAME);
    }

    static create(config?: IScreenshotPluginConfig) {
        return new ScreenshotPlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    initialize(): void {
        const context = this.getContext();

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en,
            zh,
        });
        const config: IConfig = { context };

        const item: IToolBarItemProps = {
            locale: SCREENSHOT_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <ScreenshotButton config={config} />,
        };
        context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item);
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}
}
