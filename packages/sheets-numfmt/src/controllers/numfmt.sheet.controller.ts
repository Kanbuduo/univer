import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { IRemoveSheetCommandParams, ISetNumfmtMutationParams } from '@univerjs/sheets';
import {
    factorySetNumfmtUndoMutation,
    INumfmtService,
    RemoveSheetCommand,
    SetNumfmtMutation,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';

@OnLifecycle(LifecycleStages.Rendered, NumfmtSheetController)
export class NumfmtSheetController extends Disposable {
    constructor(
        @Inject(INumfmtService) private _numfmtService: INumfmtService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector
    ) {
        super();
        this._initSheetChange();
    }

    private _initSheetChange() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations: (commandInfo) => {
                    if (commandInfo.id === RemoveSheetCommand.id) {
                        const params = commandInfo.params as IRemoveSheetCommandParams;
                        const workbookId = params.workbookId || getWorkbookId(this._univerInstanceService);
                        const worksheetId = params.worksheetId || getWorksheetId(this._univerInstanceService);
                        const model = this._numfmtService.getModel(workbookId, worksheetId);
                        if (!model) {
                            return { redos: [], undos: [] };
                        }
                        const values: Array<{ row: number; col: number }> = [];
                        model.forValue((row, col) => {
                            values.push({ row, col });
                        });
                        const redoParams: ISetNumfmtMutationParams = {
                            workbookId,
                            worksheetId,
                            values,
                        };
                        const undoParams = factorySetNumfmtUndoMutation(this._injector, redoParams);
                        return {
                            redos: [{ id: SetNumfmtMutation.id, params: redoParams }],
                            undos: [{ id: SetNumfmtMutation.id, params: undoParams }],
                        };
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }
}

const getWorkbookId = (u: IUniverInstanceService) => u.getCurrentUniverSheetInstance().getUnitId();
const getWorksheetId = (u: IUniverInstanceService) => u.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();