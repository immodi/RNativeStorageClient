export default class Stack<T> {
    items: T[];

    constructor(...initialItems: T[]) {
        this.items = [...initialItems];
    }
    
    peek() : T | null {
        return this.isEmpty() ? null : this.items[this.items.length - 1];
    }
    
    push(element: T): Stack<T> | null {
        if (this.peek() === element) {
            return null
        }
        
        this.items.push(element);
        return new Stack(...this.items);
    }

    pop() : Stack<T> {
        if (this.size() === 1) {
            return this;
        }
        
        this.items.pop();
        return new Stack(...this.items);
    }
    
    isEmpty(): boolean {
        if (this.size() === 0) {
            return true;
        } else {
            return false;
        }
    }

    size() : number {
        return this.items.length;
    }
  
    clear() : void {
        this.items = [];
    }
  
  }  