
import { useState } from "react";
import { useAppData, Category } from "@/contexts/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Edit,
  Trash2,
  ArrowDown,
  ArrowUp
} from "lucide-react";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import { TwitterPicker } from 'react-color';

const Categories = () => {
  const { 
    data, 
    addCategory,
    updateCategory,
    deleteCategory
  } = useAppData();
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Sorting and filtering
  const [categoryType, setCategoryType] = useState<"all" | "income" | "expense">("all");
  const [sortField, setSortField] = useState<keyof Category>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter categories
  const filteredCategories = data.categories.filter((category) => {
    if (categoryType === "all") return true;
    return category.type === categoryType;
  });

  // Sort categories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortField === "name" || sortField === "type") {
      const valueA = String(a[sortField]).toLowerCase();
      const valueB = String(b[sortField]).toLowerCase();
      
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    
    return 0;
  });

  // Handle sorting
  const handleSort = (field: keyof Category) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    // Check if category name already exists
    const doesNameExist = data.categories.some(
      cat => cat.name.toLowerCase() === name.toLowerCase() && 
      (!editingCategory || cat.id !== editingCategory.id)
    );
    
    if (doesNameExist) {
      newErrors.name = "A category with this name already exists";
    }
    
    if (!color) {
      newErrors.color = "Color is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle adding a new category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    addCategory({
      name,
      color,
      type
    });
    
    // Reset form and close modal
    resetForm();
    setShowAddModal(false);
  };

  // Handle editing a category
  const handleEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !editingCategory) {
      return;
    }
    
    updateCategory({
      ...editingCategory,
      name,
      color,
      type
    });
    
    // Reset form and close modal
    resetForm();
    setEditingCategory(null);
  };

  // Confirm delete category
  const confirmDelete = () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setName("");
    setColor("#3B82F6");
    setType("expense");
    setErrors({});
  };

  // Open edit modal
  const openEditModal = (category: Category) => {
    setName(category.name);
    setColor(category.color);
    setType(category.type);
    setEditingCategory(category);
  };

  // Predefined colors for color picker
  const colorOptions = [
    "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", 
    "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50", 
    "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", 
    "#FF5722", "#795548", "#607D8B"
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button 
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }} 
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories List</CardTitle>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <RadioGroup
              value={categoryType}
              onValueChange={(value) => setCategoryType(value as "all" | "income" | "expense")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income">Income</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense">Expense</Label>
              </div>
            </RadioGroup>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {sortedCategories.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Color</th>
                    <th 
                      className="text-left p-3 cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Name
                        {sortField === "name" && (
                          sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left p-3 cursor-pointer"
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center">
                        Type
                        {sortField === "type" && (
                          sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCategories.map((category) => (
                    <tr 
                      key={category.id} 
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3">
                        <div 
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: category.color }}  
                        ></div>
                      </td>
                      <td className="p-3 font-medium">{category.name}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                          category.type === "income" 
                            ? "bg-success/10 text-success" 
                            : "bg-danger/10 text-danger"
                        }`}>
                          {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-danger"
                            onClick={() => setDeletingCategory(category)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No categories found. Add a category to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Groceries, Rent, Salary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-sm text-danger">{errors.name}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Category Type</Label>
                <RadioGroup
                  value={type}
                  onValueChange={(value) => setType(value as "income" | "expense")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense-add" />
                    <Label htmlFor="expense-add" className="font-normal">Expense</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income-add" />
                    <Label htmlFor="income-add" className="font-normal">Income</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <Label>Category Color</Label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-full border border-border"
                    style={{ backgroundColor: color }}  
                  ></div>
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="mt-2">
                  <TwitterPicker 
                    color={color}
                    colors={colorOptions}
                    onChangeComplete={(color) => setColor(color.hex)}
                    triangle="hide"
                    width="100%"
                  />
                </div>
                {errors.color && <p className="text-sm text-danger">{errors.color}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCategory}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g. Groceries, Rent, Salary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-sm text-danger">{errors.name}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-type">Category Type</Label>
                <RadioGroup
                  value={type}
                  onValueChange={(value) => setType(value as "income" | "expense")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense-edit" />
                    <Label htmlFor="expense-edit" className="font-normal">Expense</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income-edit" />
                    <Label htmlFor="income-edit" className="font-normal">Income</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <Label>Category Color</Label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-full border border-border"
                    style={{ backgroundColor: color }}  
                  ></div>
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="mt-2">
                  <TwitterPicker 
                    color={color}
                    colors={colorOptions}
                    onChangeComplete={(color) => setColor(color.hex)}
                    triangle="hide"
                    width="100%"
                  />
                </div>
                {errors.color && <p className="text-sm text-danger">{errors.color}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <DeleteConfirmationModal
          title="Delete Category"
          description={`Are you sure you want to delete "${deletingCategory.name}"? This may affect transactions and budgets that use this category.`}
          open={!!deletingCategory}
          onOpenChange={(open) => !open && setDeletingCategory(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default Categories;
