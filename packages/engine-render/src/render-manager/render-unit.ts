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

import type { Nullable, UnitModel, UnitType } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import type { IDisposable, Injector } from '@wendellhu/redi';
import type { Engine } from '../engine';
import type { Scene } from '../scene';
import type { RenderComponentType } from './render-manager.service';

export interface IRender {
    unitId: string;
    engine: Engine;
    scene: Scene;
    mainComponent: Nullable<RenderComponentType>;
    components: Map<string, RenderComponentType>;
    isMainScene: boolean;
}

// eslint-disable-next-line ts/no-explicit-any
export interface IRenderControllerCtor<T extends UnitModel = UnitModel> { new(unit: IRenderContext<T>, ...args: any[]): IRenderController }
export interface IRenderController extends IDisposable {}

/**
 * This object encapsulates methods or properties to render each element.
 */
export interface IRenderContext<T extends UnitModel = UnitModel> extends IRender {
    unit: T;
    type: UnitType;
}

/**
 * This class is responsible
 */
export class RenderUnit extends Disposable implements IRender {
    readonly isRenderUnit: true;

    readonly unitId: string;
    readonly type: UnitType;

    private readonly _injector: Injector;
    private readonly _renderControllers: IRenderController[] = [];

    private _renderContext: IRenderContext<UnitModel>;
    set isMainScene(is: boolean) { this._renderContext.isMainScene = is; }
    get isMainScene(): boolean { return this._renderContext.isMainScene; }
    set engine(engine: Engine) { this._renderContext.engine = engine; }
    get engine(): Engine { return this._renderContext.engine; }
    set mainComponent(component: Nullable<RenderComponentType>) { this._renderContext.mainComponent = component; }
    get mainComponent(): Nullable<RenderComponentType> { return this._renderContext.mainComponent; }
    set scene(scene: Scene) { this._renderContext.scene = scene; }
    get scene(): Scene { return this._renderContext.scene; }
    get components() { return this._renderContext.components; }

    constructor(
        parentInjector: Injector,
        init: Pick<IRenderContext, 'engine' | 'scene' | 'isMainScene' | 'unit' >
    ) {
        super();

        this._injector = parentInjector.createChild();

        this._renderContext = {
            unit: init.unit,
            unitId: this.unitId,
            type: init.unit.type,
            components: new Map(),
            mainComponent: null,
            isMainScene: init.isMainScene,
            engine: init.engine,
            scene: init.scene,
        };
    }

    override dispose() {
        this._renderControllers.forEach((controller) => controller.dispose());
        this._renderControllers.length = 0;
    }

    addRenderControllers(ctors: IRenderControllerCtor[]) {
        this._initControllers(ctors);
    }

    private _initControllers(ctors: IRenderControllerCtor[]): void {
        ctors
            .map((ctor) => this._injector.createInstance(ctor, this._renderContext))
            .forEach((controller) => this._renderControllers.push(controller));
    }
}
