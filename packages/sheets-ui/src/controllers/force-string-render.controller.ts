/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { CellValueType, isRealNum, LifecycleStages, OnLifecycle, RxDisposable, ThemeService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

/**
 * @todo RenderUnit
 */
@OnLifecycle(LifecycleStages.Rendered, ForceStringRenderController)
export class ForceStringRenderController extends RxDisposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._initViewModelIntercept();
    }


    private _initViewModelIntercept() {
        const color = this._themeService.getCurrentTheme().errorColor;
        const FORCE_STRING_MARK = {
            tr: {
                size: 6,
                color,
            },
        };

        this.disposeWithMe(
            this._sheetInterceptorService.intercept(
                INTERCEPTOR_POINT.CELL_CONTENT,
                {

                    handler: (cell, pos, next) => {
                        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                        if (!skeleton) {
                            return next(cell);
                        }

                        const cellRaw = pos.worksheet.getCellRaw(pos.row, pos.col);

                        if (!cellRaw || cellRaw.v === null || cellRaw.v === undefined) {
                            return next(cell);
                        }

                        if (cell?.t === CellValueType.FORCE_STRING && isRealNum(cellRaw.v)) {
                            return next({
                                ...cell,
                                markers: {
                                    ...cell?.markers,
                                    ...FORCE_STRING_MARK,
                                },
                            });
                        }

                        return next(cell);
                    },
                }
            )
        );
    }
}
