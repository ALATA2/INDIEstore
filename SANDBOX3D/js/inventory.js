// Simple inventory system and DOM UI overlay manager
export class Inventory {
    constructor() {
        this.overlay = document.getElementById('inventory-overlay');
        this.grid = document.getElementById('inventory-grid');
        this.closeBtn = document.getElementById('close-inventory-btn');
        this.isOpen = false;

        // Mock items in storage chest
        this.items = [
            { id: 'wood', name: 'Oak Wood', count: 12, icon: '🪵' },
            { id: 'stone', name: 'Polished Stone', count: 8, icon: '🪨' },
            { id: 'flower', name: 'Yellow Flower', count: 4, icon: '🌼' },
            { id: 'apple', name: 'Ripe Apple', count: 5, icon: '🍎' },
            { id: 'seed', name: 'Wheat Seeds', count: 20, icon: '🌾' },
            { id: 'fish', name: 'Goldfish', count: 2, icon: '🐟' },
            { id: 'empty', name: 'Empty', count: 0, icon: '' },
            { id: 'empty', name: 'Empty', count: 0, icon: '' }
        ];

        this.setupEvents();
    }

    setupEvents() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Close on clicking outside the inventory box
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });
        }

        // Render initially
        this.render();
    }

    open() {
        this.isOpen = true;
        if (this.overlay) {
            this.overlay.classList.remove('hidden');
        }
        this.render();
    }

    close() {
        this.isOpen = false;
        if (this.overlay) {
            this.overlay.classList.add('hidden');
        }
    }

    render() {
        if (!this.grid) return;
        this.grid.innerHTML = '';

        this.items.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            
            if (item.id !== 'empty' && item.count > 0) {
                slot.classList.add('occupied');
                
                const icon = document.createElement('span');
                icon.className = 'item-icon';
                icon.innerText = item.icon;
                
                const name = document.createElement('span');
                name.className = 'item-name';
                name.innerText = item.name;

                const count = document.createElement('span');
                count.className = 'item-count';
                count.innerText = item.count;

                slot.appendChild(icon);
                slot.appendChild(name);
                slot.appendChild(count);
                
                slot.addEventListener('click', () => {
                    // Simple interaction
                    item.count--;
                    if (item.count <= 0) {
                        this.items[index] = { id: 'empty', name: 'Empty', count: 0, icon: '' };
                    }
                    this.render();
                });
            } else {
                const emptyText = document.createElement('span');
                emptyText.className = 'item-name';
                emptyText.innerText = '-';
                slot.appendChild(emptyText);
            }

            this.grid.appendChild(slot);
        });
    }

    addItem(id, name, icon, count) {
        let item = this.items.find(i => i.id === id);
        if (item) {
            item.count += count;
        } else {
            const emptyIndex = this.items.findIndex(i => i.id === 'empty');
            if (emptyIndex !== -1) {
                this.items[emptyIndex] = { id, name, count, icon };
            } else {
                this.items.push({ id, name, count, icon });
            }
        }
        this.render();
    }
}
