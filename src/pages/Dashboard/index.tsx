import { useEffect, useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

export default function Dashboard() {
  const [foods, setFoods] = useState<FoodData[]>([]);
  const [editingFood, setEditingFood] = useState<FoodData>({} as FoodData)
  const [modalOpen, setModalOpen] = useState<'add' | 'edit' | null>(null);

  useEffect(() => {
    api.get('/foods').then(response => {
      setFoods(response.data);
    });
  }, []);


  const handleAddFood = async (food: Omit<FoodData, 'id'>) => {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setFoods([...foods, response.data]);
    } catch (err) {
      console.log(err);
    }
  }

  const handleUpdateFood = async (food: FoodData) => {
    if (!editingFood.id) {
      return;
    }
    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods(foodsUpdated);
    } catch (err) {
      console.log(err);
    }
  }

  const handleDeleteFood = async (id: number | undefined) => {
    if (!id) return;
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setFoods(foodsFiltered);
  }

  const toggleModal = (toggleType: 'add' | 'edit') => {
    setModalOpen(modalOpen ? null : toggleType);
  }

  const handleEditFood = (food: FoodData) => {
    setEditingFood(food);
    setModalOpen('edit');
  }

  return (
    <>
      <Header openModal={() => toggleModal('add')} />
      <ModalAddFood
        isOpen={modalOpen === 'add'}
        setIsOpen={() => toggleModal('add')}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={modalOpen === 'edit'}
        setIsOpen={() => toggleModal('edit')}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
        foods.map(food => (
          <Food
            key={food.id}
            food={food}
            handleDelete={handleDeleteFood}
            handleEditFood={handleEditFood}
          />
        ))}
      </FoodsContainer>
    </>
  );
}
