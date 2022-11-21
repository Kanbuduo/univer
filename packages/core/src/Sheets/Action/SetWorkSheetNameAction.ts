import { SetWorkSheetName } from '../Apply';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface ISetWorkSheetNameActionData extends ISheetActionData {
    sheetName: string;
}

/**
 * @internal
 */
export class SetWorkSheetNameAction extends SheetActionBase<
    ISetWorkSheetNameActionData,
    ISetWorkSheetNameActionData,
    string
> {
    constructor(
        actionData: ISetWorkSheetNameActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };

        this._oldActionData = {
            ...actionData,
            sheetName: this.do(),
            convertor: [],
        };
        this.validate();
    }

    do(): string {
        const worksheet = this.getWorkSheet();

        const result = SetWorkSheetName(worksheet, this._doActionData.sheetName);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    redo(): void {
        // update pre data
        const { sheetId } = this._doActionData;
        this._oldActionData = {
            sheetId,
            actionName: ACTION_NAMES.SET_WORKSHEET_NAME_ACTION,
            sheetName: this.do(),
        };
    }

    undo(): void {
        const { sheetName, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();

        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.SET_WORKSHEET_NAME_ACTION,
            sheetId,
            sheetName: SetWorkSheetName(worksheet, sheetName),
        };

        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
    }

    validate(): boolean {
        return false;
    }
}
