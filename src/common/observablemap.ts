// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  IDisposable
} from 'phosphor/lib/core/disposable';

import {
  clearSignalData, defineSignal, ISignal
} from 'phosphor/lib/core/signaling';


/**
 * A map which can be observed for changes.
 */
export
interface IObservableMap<T> extends IDisposable {
  /**
   * A signal emitted when the map has changed.
   */
  changed: ISignal<IObservableMap<T>, ObservableMap.IChangedArgs<T>>;

  /**
   * The number of key-value pairs in the map.
   */
  readonly size: number;

  /**
   * Set a key-value pair in the map
   *
   * @param key - The key to set.
   *
   * @param value - The value for the key.
   *
   * @returns the old value for the key, or undefined
   *   if that did not exist.
   */
  set(key: string, value: T): T;

  /**
   * Get a value for a given key.
   *
   * @param key - the key.
   *
   * @returns the value for that key.
   */
  get(key: string): T;

  /**
   * Check whether the map has a key.
   *
   * @param key - the key to check.
   *
   * @returns `true` if the map has the key, `false` otherwise.
   */
  has(key: string): boolean;

  /**
   * Get a list of the keys in the map.
   *
   * @returns - a list of keys.
   */
  keys(): string[];

  /**
   * Get a list of the values in the map.
   *
   * @returns - a list of values.
   */
  values(): T[];

  /**
   * Remove a key from the map
   *
   * @param key - the key to remove.
   *
   * @returns the value of the given key,
   *   or undefined if that does not exist. 
   */
  delete(key: string): T;

  /**
   * Set the ObservableMap to an empty map.
   */
  clear(): void;

  /**
   * Dispose of the resources held by the map.
   */
  dispose(): void;
}

/**
 * A concrete implementation of IObservbleMap<T>.
 */
export
class ObservableMap<T> implements IObservableMap<T> {

  /**
   * A signal emitted when the map has changed.
   */
  changed: ISignal<IObservableMap<T>, ObservableMap.IChangedArgs<T>>;

  /**
   * Whether this map has been disposed.
   */
  get isDisposed(): boolean {
    return this._map === null;
  }

  /**
   * The number of key-value pairs in the map.
   */
  get size(): number {
    return this._map.size;
  }

  /**
   * Set a key-value pair in the map
   *
   * @param key - The key to set.
   *
   * @param value - The value for the key.
   *
   * @returns the old value for the key, or undefined
   *   if that did not exist.
   */
  set(key: string, value: T): T {
    let oldVal = this._map.get(key);
    this._map.set(key, value);
    this.changed.emit({
      type: oldVal ? 'change' : 'add',
      key: key,
      oldValue: oldVal,
      newValue: value
    });
    return oldVal;
  }

  /**
   * Get a value for a given key.
   *
   * @param key - the key.
   *
   * @returns the value for that key.
   */
  get(key: string): T {
    return this._map.get(key);
  }

  /**
   * Check whether the map has a key.
   *
   * @param key - the key to check.
   *
   * @returns `true` if the map has the key, `false` otherwise.
   */
  has(key: string): boolean {
    return this._map.has(key);
  }

  /**
   * Get a list of the keys in the map.
   *
   * @returns - a list of keys.
   */
  keys(): string[] {
    let keyList: string[] = [];
    this._map.forEach((v: T, k: string)=>{
      keyList.push(k);
    });
    return keyList;
  }


  /**
   * Get a list of the values in the map.
   *
   * @returns - a list of values.
   */
  values(): T[] {
    let valList: T[] = [];
    this._map.forEach((v: T, k: string)=>{
      valList.push(v);
    });
    return valList;
  }

  /**
   * Remove a key from the map
   *
   * @param key - the key to remove.
   *
   * @returns the value of the given key,
   *   or undefined if that does not exist.
   */
  delete(key: string): T {
    let oldVal = this._map.get(key);
    this._map.delete(key);
    this.changed.emit({
      type: 'remove',
      key: key,
      oldValue: oldVal,
      newValue: undefined
    });
    return oldVal;
  }

  /**
   * Set the ObservableMap to an empty map.
   */
  clear(): void {
    //delete one by one to emit the correct signals.
    let keyList = this.keys();
    for(let i=0; i<keyList.length; i++) {
      this.delete(keyList[i]);
    }
  }

  /**
   * Dispose of the resources held by the map.
   */
  dispose(): void {
    if(this._map === null) {
      return;
    }
    this._map.clear();
    this._map = null;
  }

  private _map: Map<string, T> = new Map<string, T>();
}

/**
 * The namespace for `ObservableMap` class statics.
 */
export
namespace ObservableMap {
  /**
   * The change types which occur on an observable map.
   */
  export
  type ChangeType =
    /**
     * An entry was added.
     */
    'add' |

    /**
     * An entry was removed.
     */
    'remove' |

    /**
     * An entry was changed.
     */
    'change';

  /**
   * The changed args object which is emitted by an observable map.
   */
  export
  interface IChangedArgs<T> {
    /**
     * The type of change undergone by the map.
     */
    type: ChangeType;

    /**
     * The key of the change.
     */
    key: string;

    /**
     * The old value of the change.
     */
    oldValue: T;

    /**
     * The new value of the change.
     */
    newValue: T;
  }
}

// Define the signals for the `ObservableMap` class.
defineSignal(ObservableMap.prototype, 'changed');
